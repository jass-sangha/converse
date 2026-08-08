<?php

namespace Converse\Chat\Console\Commands;

use Converse\Chat\Models\Message;
use Illuminate\Console\Command;

class PruneExpiredMessagesCommand extends Command
{
    protected $signature = 'chat:prune-expired-messages';

    protected $description = 'Permanently delete disappearing messages whose TTL has elapsed.';

    public function handle(): int
    {
        $count = Message::query()
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->delete();

        $this->info("Pruned {$count} expired message(s).");

        return self::SUCCESS;
    }
}
