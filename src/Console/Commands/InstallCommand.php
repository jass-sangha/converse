<?php

namespace Riwaaq\Chat\Console\Commands;

use Illuminate\Console\Command;

class InstallCommand extends Command
{
    protected $signature = 'chat:install';

    protected $description = 'Publish Riwaaq Chat config, views, and theme in one step.';

    public function handle(): int
    {
        $this->call('vendor:publish', ['--tag' => 'chat-config']);
        $this->call('vendor:publish', ['--tag' => 'chat-views']);
        $this->call('vendor:publish', ['--tag' => 'chat-theme']);
        $this->call('vendor:publish', ['--tag' => 'chat-icons']);
        $this->call('vendor:publish', ['--tag' => 'chat-wallpapers']);

        $this->newLine();
        $this->info('Riwaaq Chat published. Next steps:');
        $this->line('  1. Configure config/chat.php — chatable_models, table_names, media disk, theme.overrides, etc.');
        $this->line('  2. Drop <x-chat::widget /> into any Blade layout to embed chat, or visit /riwaaq/chat for the full-page UI.');
        $this->line('  3. Edit public/vendor/chat/theme.css for full color/border-radius/font/shadow control.');
        $this->line('  4. Edit public/vendor/chat/icons.js to swap any icon — empty by default (ships every icon as-is).');
        $this->line('  5. Edit public/vendor/chat/wallpapers.js to add/replace wallpaper patterns or colors — empty by default.');
        $this->newLine();
        $this->comment('Migrations are NOT published by default — they run automatically on boot. Run `php artisan vendor:publish --tag=chat-migrations` yourself if you need to edit them directly.');

        return self::SUCCESS;
    }
}
