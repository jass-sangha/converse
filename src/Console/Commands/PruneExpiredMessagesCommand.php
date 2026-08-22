<?php

namespace Riwaaq\Chat\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Riwaaq\Chat\Contracts\AttachmentServiceInterface;
use Riwaaq\Chat\Models\Message;
use Riwaaq\Chat\Models\MessageAttachment;

class PruneExpiredMessagesCommand extends Command
{
    protected $signature = 'chat:prune-expired-messages';

    protected $description = 'Permanently delete disappearing messages whose TTL has elapsed, and any uploaded attachment that was never attached to a message.';

    public function __construct(protected AttachmentServiceInterface $attachments)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $messageCount = $this->pruneExpiredMessages();
        $orphanCount = $this->pruneOrphanedAttachments();

        $this->info("Pruned {$messageCount} expired message(s) and {$orphanCount} orphaned attachment(s).");

        return self::SUCCESS;
    }

    protected function pruneExpiredMessages(): int
    {
        $count = 0;

        Message::query()
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->with('attachments')
            ->chunkById(200, function (Collection $messages) use (&$count) {
                $attachments = $messages->flatMap->attachments;

                // Delete the attachment rows explicitly instead of relying on cascadeOnDelete
                // when the message row goes — SQLite (used in tests) doesn't enforce foreign
                // keys unless DB_FOREIGN_KEYS is set, so the cascade wouldn't fire there. Doing
                // it first also means deleteOrphanedFiles()'s "still referenced" check only sees
                // rows outside this batch — otherwise two messages sharing a forwarded
                // attachment that expire in the same run would each see the other's row and
                // wrongly conclude the file is still in use.
                MessageAttachment::query()->whereIn('id', $attachments->pluck('id'))->delete();
                Message::query()->whereIn('id', $messages->pluck('id'))->delete();

                $this->attachments->deleteOrphanedFiles($attachments);

                $count += $messages->count();
            });

        return $count;
    }

    protected function pruneOrphanedAttachments(): int
    {
        $cutoff = now()->subMinutes(config('chat.media.orphan_ttl_minutes', 1440));
        $count = 0;

        MessageAttachment::query()
            ->whereNull('message_id')
            ->where('created_at', '<=', $cutoff)
            ->chunkById(200, function (Collection $attachments) use (&$count) {
                MessageAttachment::query()->whereIn('id', $attachments->pluck('id'))->delete();

                $this->attachments->deleteOrphanedFiles($attachments);

                $count += $attachments->count();
            });

        return $count;
    }
}
