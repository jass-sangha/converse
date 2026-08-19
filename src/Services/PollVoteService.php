<?php

namespace Riwaaq\Chat\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Riwaaq\Chat\Contracts\PollVoteServiceInterface;
use Riwaaq\Chat\Events\PollVoted;
use Riwaaq\Chat\Models\Message;
use Riwaaq\Chat\Models\PollVote;

class PollVoteService implements PollVoteServiceInterface
{
    public function toggle(Message $message, Model $chatable, int $optionIndex): Collection
    {
        $options = $message->metadata['options'] ?? [];
        abort_unless($optionIndex >= 0 && $optionIndex < count($options), 422, 'Invalid poll option.');

        $multiple = (bool) ($message->metadata['multiple'] ?? false);

        DB::transaction(function () use ($message, $chatable, $optionIndex, $multiple) {
            $existing = PollVote::query()
                ->where('message_id', $message->id)
                ->where('chatable_type', $chatable->getMorphClass())
                ->where('chatable_id', $chatable->getKey())
                ->where('option_index', $optionIndex)
                ->first();

            if ($existing) {
                $existing->delete();

                return;
            }

            if (! $multiple) {
                PollVote::query()
                    ->where('message_id', $message->id)
                    ->where('chatable_type', $chatable->getMorphClass())
                    ->where('chatable_id', $chatable->getKey())
                    ->delete();
            }

            PollVote::query()->create([
                'message_id' => $message->id,
                'chatable_type' => $chatable->getMorphClass(),
                'chatable_id' => $chatable->getKey(),
                'option_index' => $optionIndex,
            ]);
        });

        $tally = $this->tally($message);

        broadcast(new PollVoted($message->id, $message->conversation_id, $tally))->toOthers();

        return $tally;
    }

    /**
     * Deliberately viewer-agnostic: this same collection is sent to every recipient of the
     * `.message.poll-voted` broadcast, so it can't carry a "my votes" field scoped to whoever
     * cast the vote. Each client derives its own vote state by matching its chatable key
     * against each option's `voters` list (see MessageResource for the equivalent per-request
     * "my_votes" computed only for the actual viewer of that response).
     */
    protected function tally(Message $message): Collection
    {
        $votes = PollVote::query()->where('message_id', $message->id)->get();
        $optionCount = count($message->metadata['options'] ?? []);

        $options = collect(range(0, max($optionCount - 1, -1)))->map(function (int $index) use ($votes) {
            $group = $votes->where('option_index', $index);

            return [
                'index' => $index,
                'count' => $group->count(),
                'voters' => $group->map(fn (PollVote $v) => ['type' => $v->chatable_type, 'id' => $v->chatable_id])->values(),
            ];
        })->values();

        return collect([
            'options' => $options,
            'total_voters' => $votes->unique(fn (PollVote $v) => $v->chatable_type.':'.$v->chatable_id)->count(),
        ]);
    }
}
