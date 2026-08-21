<?php

namespace Riwaaq\Chat\Console\Commands;

use Illuminate\Console\Command;
use Riwaaq\Chat\Contracts\AttachmentServiceInterface;
use Riwaaq\Chat\Models\MessageAttachment;

class PruneOrphanedAttachmentsCommand extends Command
{
    protected $signature = 'chat:prune-orphaned-attachments';

    protected $description = 'Permanently delete uploaded attachments that were never attached to a message.';

    public function __construct(protected AttachmentServiceInterface $attachments)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $cutoff = now()->subMinutes(config('chat.media.orphan_ttl_minutes', 1440));
        $count = 0;

        MessageAttachment::query()
            ->whereNull('message_id')
            ->where('created_at', '<=', $cutoff)
            ->chunkById(200, function ($attachments) use (&$count) {
                MessageAttachment::query()->whereIn('id', $attachments->pluck('id'))->delete();

                $this->attachments->deleteOrphanedFiles($attachments);

                $count += $attachments->count();
            });

        $this->info("Pruned {$count} orphaned attachment(s).");

        return self::SUCCESS;
    }
}
