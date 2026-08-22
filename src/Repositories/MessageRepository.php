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
use Riwaaq\Chat\Models\MessageReceipt;
use Riwaaq\Chat\Models\UserSetting;

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
            // receipts.chatable deliberately absent — see receiptSummariesFor() and
            // MessageController::index(), which attach a batched per-message summary instead of
            // eager-loading every receipt row for a whole page of messages.
            ->with(['chatable', 'attachments', 'reactions', 'replyTo.attachments', 'starredBy', 'pinnedIn', 'pollVotes', 'eventRsvps'])
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
            // receipts.chatable deliberately absent — see receiptSummariesFor().
            ->with(['chatable', 'attachments', 'reactions', 'replyTo.attachments', 'starredBy', 'pinnedIn', 'pollVotes', 'eventRsvps', 'conversation', 'conversation.participants:id,conversation_id,chatable_type,chatable_id'])
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

    /**
     * Per-message recipient/delivered/read counts instead of the full receipt rows (each with
     * its chatable model) MessageResource::receiptStatus() used to need to derive sent/
     * delivered/read — a 50-message page in a 200-participant conversation used to mean loading
     * up to ~10,000 receipt+chatable rows just to answer three counts per message.
     *
     * @param  list<int>  $messageIds
     * @return array<int, array{recipient_count: int, delivered_count: int, read_count: int}>
     */
    public function receiptSummariesFor(array $messageIds): array
    {
        if ($messageIds === []) {
            return [];
        }

        $receiptsTable = (new MessageReceipt)->getTable();

        // recipient_count/delivered_count don't depend on any privacy setting, so one grouped
        // aggregate covers every message in the batch — no chatable model needed at all.
        $counts = DB::table($receiptsTable)
            ->whereIn('message_id', $messageIds)
            ->select('message_id')
            ->selectRaw('COUNT(*) as recipient_count')
            ->selectRaw('SUM(CASE WHEN delivered_at IS NOT NULL THEN 1 ELSE 0 END) as delivered_count')
            ->groupBy('message_id')
            ->get()
            ->keyBy('message_id');

        $readCounts = $this->readCountsRespectingPrivacy($messageIds);

        $summaries = [];

        foreach ($messageIds as $id) {
            $row = $counts->get($id);

            $summaries[$id] = [
                'recipient_count' => $row ? (int) $row->recipient_count : 0,
                'delivered_count' => $row ? (int) $row->delivered_count : 0,
                'read_count' => $readCounts[$id] ?? 0,
            ];
        }

        return $summaries;
    }

    /**
     * A receipt only "counts as read" if the recipient's *current* read-receipts privacy
     * setting allows it (UserSetting::readReceiptsVisible() — a boolean plus a "hidden until"
     * timestamp override) — not something worth re-deriving across three DB drivers in raw SQL,
     * so this reuses the real model method instead of duplicating its logic. Only loads the
     * receipts that are actually read (bounded by how many recipients have read the page's
     * messages, not by total recipients) and only the small chat_user_settings row per distinct
     * chatable, grouped by morph type the same way UserSettingsService::preload() batches it —
     * never a full chatable model.
     *
     * @param  list<int>  $messageIds
     * @return array<int, int> read count keyed by message_id
     */
    protected function readCountsRespectingPrivacy(array $messageIds): array
    {
        $readReceipts = MessageReceipt::query()
            ->whereIn('message_id', $messageIds)
            ->whereNotNull('read_at')
            ->get(['message_id', 'chatable_type', 'chatable_id']);

        if ($readReceipts->isEmpty()) {
            return [];
        }

        $settingsByKey = [];

        foreach ($readReceipts->groupBy('chatable_type') as $type => $group) {
            UserSetting::query()
                ->where('chatable_type', $type)
                ->whereIn('chatable_id', $group->pluck('chatable_id')->unique())
                ->get()
                ->each(function (UserSetting $setting) use (&$settingsByKey) {
                    $settingsByKey[$setting->chatable_type.'|'.$setting->chatable_id] = $setting;
                });
        }

        $default = (bool) config('chat.privacy.read_receipts_default', true);
        $counts = [];

        foreach ($readReceipts as $receipt) {
            $key = $receipt->chatable_type.'|'.$receipt->chatable_id;
            $allows = isset($settingsByKey[$key]) ? $settingsByKey[$key]->readReceiptsVisible() : $default;

            if ($allows) {
                $counts[$receipt->message_id] = ($counts[$receipt->message_id] ?? 0) + 1;
            }
        }

        return $counts;
    }
}
