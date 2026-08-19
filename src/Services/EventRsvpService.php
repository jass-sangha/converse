<?php

namespace Riwaaq\Chat\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Riwaaq\Chat\Contracts\EventRsvpServiceInterface;
use Riwaaq\Chat\Events\EventRsvped;
use Riwaaq\Chat\Models\EventRsvp;
use Riwaaq\Chat\Models\Message;

class EventRsvpService implements EventRsvpServiceInterface
{
    public const STATUSES = ['going', 'maybe', 'declined'];

    public function respond(Message $message, Model $chatable, ?string $status): Collection
    {
        abort_if($status !== null && ! in_array($status, self::STATUSES, true), 422, 'Invalid RSVP status.');

        if ($status === null) {
            EventRsvp::query()
                ->where('message_id', $message->id)
                ->where('chatable_type', $chatable->getMorphClass())
                ->where('chatable_id', $chatable->getKey())
                ->delete();
        } else {
            EventRsvp::query()->updateOrCreate(
                ['message_id' => $message->id, 'chatable_type' => $chatable->getMorphClass(), 'chatable_id' => $chatable->getKey()],
                ['status' => $status],
            );
        }

        $tally = $this->tally($message);

        broadcast(new EventRsvped($message->id, $message->conversation_id, $tally))->toOthers();

        return $tally;
    }

    /**
     * Viewer-agnostic for the same reason as PollVoteService::tally() — see that docblock.
     */
    protected function tally(Message $message): Collection
    {
        $rsvps = EventRsvp::query()->where('message_id', $message->id)->get();

        return collect(self::STATUSES)->mapWithKeys(function (string $status) use ($rsvps) {
            $group = $rsvps->where('status', $status);

            return [$status => [
                'count' => $group->count(),
                'respondents' => $group->map(fn (EventRsvp $r) => ['type' => $r->chatable_type, 'id' => $r->chatable_id])->values(),
            ]];
        });
    }
}
