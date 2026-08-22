<?php

namespace Riwaaq\Chat\Repositories;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Riwaaq\Chat\Chat;
use Riwaaq\Chat\Contracts\MessageRepositoryInterface;
use Riwaaq\Chat\Models\Conversation;
use Riwaaq\Chat\Models\Message;
use Riwaaq\Chat\Models\MessageDeletion;

class MessageRepository implements MessageRepositoryInterface
{
    public function create(array $data): Message
    {
        return Message::query()->create($data);
    }

    public function findById(int $id): Message
    {
        return Message::query()->findOrFail($id);
    }

    // simplePaginate(), not paginate(): the chat scroll is a before_id cursor UI (see
    // useMessages.js) that only ever reads data.data and derives its next cursor from the last
    // message's own id — it never touches total/last_page. paginate()'s extra SELECT COUNT(*)
    // (through the whereDoesntHave deletions subquery, on every single page load) buys nothing
    // here, so simplePaginate()'s "fetch perPage+1, no count" is a same-shape, zero-cost swap.
    public function paginateForConversation(
        Conversation $conversation,
        Model $chatable,
        int $perPage,
        ?int $beforeId = null
    ): Paginator {
        $query = Message::query()
            ->where('conversation_id', $conversation->id)
            ->whereDoesntHave('deletions', fn ($q) => Chat::whereChatable($q, $chatable))
            ->with(['chatable', 'attachments', 'reactions', 'replyTo.attachments', 'receipts.chatable', 'starredBy', 'pinnedIn', 'pollVotes', 'eventRsvps'])
            ->orderByDesc('id');

        if ($beforeId !== null) {
            $query->where('id', '<', $beforeId);
        }

        return $query->simplePaginate($perPage);
    }

    // simplePaginate() for the same reason as paginateForConversation() above — search() (see
    // useMessages.js::search()) also only reads data.data, never total/last_page.
    public function search(Model $chatable, string $query, ?int $conversationId, int $perPage): Paginator
    {
        $builder = Message::query()
            ->whereHas('conversation.participants', fn ($q) => Chat::whereChatable($q, $chatable)->whereNull('left_at'))
            ->whereDoesntHave('deletions', fn ($q) => Chat::whereChatable($q, $chatable))
            ->whereNull('deleted_for_everyone_at')
            // 'conversation.participants' is column-restricted: MessageResource only ever
            // reads chatable_type/chatable_id off of it (to build the frontend's
            // chatableKey()), so there's no reason to pull role/muted_until/archived_at/etc.
            // for every participant of every conversation a search result happens to land in.
            ->with(['chatable', 'attachments', 'reactions', 'replyTo.attachments', 'receipts.chatable', 'starredBy', 'pinnedIn', 'pollVotes', 'eventRsvps', 'conversation', 'conversation.participants:id,conversation_id,chatable_type,chatable_id'])
            ->orderByDesc('id');

        $this->matchBody($builder, $query);

        if ($conversationId !== null) {
            $builder->where('conversation_id', $conversationId);
        }

        return $builder->simplePaginate($perPage);
    }

    /**
     * MySQL/Postgres get a real FULLTEXT/tsvector index (see create_chat_messages_table)
     * instead of a leading-wildcard LIKE scan, which can't use any index and gets slower as
     * message volume grows. SQLite (used in tests) has no full-text support, so it falls back
     * to an escaped LIKE — fine at test/tiny-install scale.
     */
    protected function matchBody(Builder $builder, string $query): void
    {
        if (in_array(DB::connection()->getDriverName(), ['mysql', 'pgsql'], true)) {
            $builder->whereFullText('body', $query);

            return;
        }

        $builder->whereRaw('body LIKE ? ESCAPE ?', [$this->likeTerm($query), '\\']);
    }

    // Un-escaped % and _ in a user-supplied search term are interpreted as SQL LIKE wildcards
    // rather than literal characters, over/under-matching for anyone actually searching for
    // those characters (e.g. "50%"). Not injection — the value is still bound as a parameter —
    // just wrong results.
    protected function likeTerm(string $value): string
    {
        return '%'.addcslashes($value, '\\%_').'%';
    }

    public function media(Model $chatable, string $kind, ?int $conversationId, int $perPage, ?string $search = null): LengthAwarePaginator
    {
        $builder = Message::query()
            ->whereHas('conversation.participants', fn ($q) => Chat::whereChatable($q, $chatable)->whereNull('left_at'))
            ->whereDoesntHave('deletions', fn ($q) => Chat::whereChatable($q, $chatable))
            ->whereNull('deleted_for_everyone_at')
            ->with(['chatable', 'attachments', 'conversation'])
            ->orderByDesc('id');

        match ($kind) {
            'media' => $builder->whereIn('type', ['image', 'video', 'gif']),
            'docs' => $builder->where('type', 'document'),
            // has_link is computed at write time (see Message::hasLinkInBody(), set in
            // MessageService::send()/update()) from the same "any URL in the body" rule this
            // used to check here with a leading-wildcard `body LIKE '%http%'` scan — indexed
            // now instead of a full table scan.
            'links' => $builder->where('type', 'text')->where('has_link', true),
        };

        if ($conversationId !== null) {
            $builder->where('conversation_id', $conversationId);
        }

        if ($search !== null && $search !== '') {
            $matches = Chat::matchingChatablePairs($search);
            $term = $this->likeTerm($search);

            $builder->where(function ($outer) use ($term, $matches) {
                $outer->whereHas('attachments', fn ($q) => $q->whereRaw('original_filename LIKE ? ESCAPE ?', [$term, '\\']))
                    ->orWhereRaw('body LIKE ? ESCAPE ?', [$term, '\\'])
                    ->orWhereHas('conversation', fn ($q) => $q->whereRaw('name LIKE ? ESCAPE ?', [$term, '\\']));

                if (! empty($matches)) {
                    $outer->orWhereHas('conversation.participants', function ($participantQuery) use ($matches) {
                        $participantQuery->where(function ($inner) use ($matches) {
                            foreach ($matches as [$type, $id]) {
                                $inner->orWhere(fn ($q) => $q->where('chatable_type', $type)->where('chatable_id', $id));
                            }
                        });
                    });
                }
            });
        }

        return $builder->paginate($perPage);
    }

    public function clearForChatable(Conversation $conversation, Model $chatable): void
    {
        // chunkById(200), not pluck() over the whole conversation then map() into an
        // equally-sized array of upsert rows: a conversation with hundreds of thousands of
        // messages would otherwise hold every id, then every row, in memory at once before a
        // single query runs. Advancing by id never re-processes or skips a row here — each
        // chunk's own upsert gives its messages a deletion row for this chatable, which is
        // exactly what whereDoesntHave('deletions', ...) already excludes them on, so the next
        // chunk's query naturally never sees them again.
        Message::query()
            ->where('conversation_id', $conversation->id)
            ->whereDoesntHave('deletions', fn ($q) => Chat::whereChatable($q, $chatable))
            ->chunkById(200, function (Collection $messages) use ($chatable) {
                $rows = $messages->map(fn (Message $message) => [
                    'message_id' => $message->id,
                    'chatable_type' => $chatable->getMorphClass(),
                    'chatable_id' => $chatable->getKey(),
                    'deleted_at' => now(),
                ])->all();

                MessageDeletion::query()->upsert($rows, ['message_id', 'chatable_type', 'chatable_id'], ['deleted_at']);
            });
    }
}
