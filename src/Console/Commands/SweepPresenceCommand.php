<?php

namespace Converse\Chat\Console\Commands;

use Converse\Chat\Contracts\PresenceServiceInterface;
use Illuminate\Console\Command;

class SweepPresenceCommand extends Command
{
    protected $signature = 'chat:sweep-presence';

    protected $description = 'Mark users whose presence heartbeat has expired as offline and broadcast the change.';

    public function handle(PresenceServiceInterface $presence): int
    {
        $count = $presence->sweepStale();

        $this->info("Marked {$count} user(s) offline.");

        return self::SUCCESS;
    }
}
