<?php

namespace Riwaaq\Chat\Console\Commands;

use Illuminate\Console\Command;
use Riwaaq\Chat\Contracts\AttachmentServiceInterface;
use Riwaaq\Chat\Models\Message;
use Riwaaq\Chat\Models\MessageAttachment;

class PruneExpiredMessagesCommand extends Command
{
    protected $signature = 'chat:prune-expired-messages';

    protected $description = 'Permanently delete disappearing messages whose TTL has elapsed.';

    public function __construct(protected AttachmentServiceInterface $attachments)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $count = 0;

        Message::query()
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->with('attachments')
            ->chunkById(200, function ($messages) use (&$count) {
                $attachments = $messages->flatMap->attachments;

                // Delete the attachment rows explicitly rather than relying on the FK's
                // cascadeOnDelete to remove them when the message row goes — SQLite (used in
                // tests) doesn't enforce foreign keys unless DB_FOREIGN_KEYS is set, so the
                // cascade silently wouldn't fire there. Doing it up front also means
                // deleteOrphanedFiles()'s "still referenced" check only sees rows outside this
                // expiring batch — otherwise two messages sharing a forwarded attachment that
                // expire in the same run would each see the other's row and wrongly conclude
                // the file is still in use.
                MessageAttachment::query()->whereIn('id', $attachments->pluck('id'))->delete();
                Message::query()->whereIn('id', $messages->pluck('id'))->delete();

                $this->attachments->deleteOrphanedFiles($attachments);

                $count += $messages->count();
            });

        $this->info("Pruned {$count} expired message(s).");

        return self::SUCCESS;
    }
}
