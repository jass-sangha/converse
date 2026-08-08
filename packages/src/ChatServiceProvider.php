<?php

namespace Converse\Chat;

use Converse\Chat\Console\Commands\PruneExpiredMessagesCommand;
use Converse\Chat\Console\Commands\SweepPresenceCommand;
use Converse\Chat\Contracts\AttachmentServiceInterface;
use Converse\Chat\Contracts\BlockedUserServiceInterface;
use Converse\Chat\Contracts\ConversationRepositoryInterface;
use Converse\Chat\Contracts\ConversationServiceInterface;
use Converse\Chat\Contracts\LinkPreviewFetcher;
use Converse\Chat\Contracts\MediaProcessor;
use Converse\Chat\Contracts\MessageReactionServiceInterface;
use Converse\Chat\Contracts\MessageReceiptServiceInterface;
use Converse\Chat\Contracts\MessageRepositoryInterface;
use Converse\Chat\Contracts\MessageServiceInterface;
use Converse\Chat\Contracts\ParticipantRepositoryInterface;
use Converse\Chat\Contracts\ParticipantServiceInterface;
use Converse\Chat\Contracts\PinnedMessageServiceInterface;
use Converse\Chat\Contracts\PresenceServiceInterface;
use Converse\Chat\Contracts\StarredMessageServiceInterface;
use Converse\Chat\Contracts\UserSearchServiceInterface;
use Converse\Chat\Contracts\UserSettingsServiceInterface;
use Converse\Chat\Models\Conversation;
use Converse\Chat\Models\Message;
use Converse\Chat\Policies\ConversationPolicy;
use Converse\Chat\Policies\MessagePolicy;
use Converse\Chat\Repositories\ConversationRepository;
use Converse\Chat\Repositories\MessageRepository;
use Converse\Chat\Repositories\ParticipantRepository;
use Converse\Chat\Services\AttachmentService;
use Converse\Chat\Services\BlockedUserService;
use Converse\Chat\Services\ConversationService;
use Converse\Chat\Services\MessageReactionService;
use Converse\Chat\Services\MessageReceiptService;
use Converse\Chat\Services\MessageService;
use Converse\Chat\Services\NullMediaProcessor;
use Converse\Chat\Services\OpenGraphLinkPreviewFetcher;
use Converse\Chat\Services\ParticipantService;
use Converse\Chat\Services\PinnedMessageService;
use Converse\Chat\Services\PresenceService;
use Converse\Chat\Services\StarredMessageService;
use Converse\Chat\Services\UserSearchService;
use Converse\Chat\Services\UserSettingsService;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\Gate;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;
use Spatie\LaravelPackageTools\Package;
use Spatie\LaravelPackageTools\PackageServiceProvider;

class ChatServiceProvider extends PackageServiceProvider
{
    /**
     * Auto-bound by Laravel's base ServiceProvider (interface => concrete).
     */
    public array $bindings = [
        ParticipantRepositoryInterface::class => ParticipantRepository::class,
        ConversationRepositoryInterface::class => ConversationRepository::class,
        MessageRepositoryInterface::class => MessageRepository::class,
        ConversationServiceInterface::class => ConversationService::class,
        MessageServiceInterface::class => MessageService::class,
        MessageReactionServiceInterface::class => MessageReactionService::class,
        StarredMessageServiceInterface::class => StarredMessageService::class,
        MessageReceiptServiceInterface::class => MessageReceiptService::class,
        PresenceServiceInterface::class => PresenceService::class,
        ParticipantServiceInterface::class => ParticipantService::class,
        BlockedUserServiceInterface::class => BlockedUserService::class,
        AttachmentServiceInterface::class => AttachmentService::class,
        MediaProcessor::class => NullMediaProcessor::class,
        LinkPreviewFetcher::class => OpenGraphLinkPreviewFetcher::class,
        UserSearchServiceInterface::class => UserSearchService::class,
        PinnedMessageServiceInterface::class => PinnedMessageService::class,
        UserSettingsServiceInterface::class => UserSettingsService::class,
    ];

    protected array $policies = [
        Conversation::class => ConversationPolicy::class,
        Message::class => MessagePolicy::class,
    ];

    public function configurePackage(Package $package): void
    {
        $package->name('chat')->hasConfigFile();

        if ((bool) env('CHAT_RUN_MIGRATIONS', true)) {
            // discoversMigrations() (not hasMigrations()) preserves the timestamp-prefixed
            // filenames' natural sort order, which matters here since several tables have
            // foreign keys to earlier ones — hasMigrations() sorts by the bare name instead,
            // which silently breaks creation order (tolerated by SQLite, fatal on MySQL/Postgres).
            $package->discoversMigrations()->runsMigrations();
        }

        if ((bool) env('CHAT_REGISTER_ROUTES', true)) {
            $package->hasRoutes(['api', 'channels']);
        }

        if ((bool) env('CHAT_REGISTER_UI_ROUTES', true)) {
            $package->hasRoutes('web')->hasViews();
        }

        $package->hasCommands([SweepPresenceCommand::class, PruneExpiredMessagesCommand::class]);
    }

    public function packageBooted(): void
    {
        foreach ($this->policies as $model => $policy) {
            Gate::policy($model, $policy);
        }

        Relation::enforceMorphMap(Chat::chatableModels());

        $this->registerDefaultDisk();
        $this->registerStatefulApiMiddleware();

        $this->publishes([
            __DIR__.'/../resources/css/theme.css' => public_path('vendor/chat/theme.css'),
        ], 'chat-theme');
    }

    /**
     * The bundled chat UI authenticates via Sanctum's session-cookie flow, which needs
     * EnsureFrontendRequestsAreStateful on the 'api' middleware group. Registering it here
     * (rather than asking the host app to call $middleware->statefulApi() in bootstrap/app.php)
     * keeps the package self-contained — installing it is enough, no host wiring required.
     *
     * Pushed onto the HTTP Kernel (not the Router) deliberately: the Kernel is the source of
     * truth for middleware groups and re-syncs its own copy to the Router whenever any provider
     * booting after us — Sanctum's own service provider included — touches the Kernel's
     * middleware priority list. A push made directly on the Router gets silently overwritten by
     * that later re-sync since the Router's array is just a mirror of the Kernel's.
     */
    protected function registerStatefulApiMiddleware(): void
    {
        if (! (bool) env('CHAT_STATEFUL_API', true)) {
            return;
        }

        $this->app[Kernel::class]->prependMiddlewareToGroup('api', EnsureFrontendRequestsAreStateful::class);
    }

    protected function registerDefaultDisk(): void
    {
        $disk = config('chat.media.disk', 'chat');

        if (config("filesystems.disks.{$disk}")) {
            return;
        }

        config(["filesystems.disks.{$disk}" => [
            'driver' => 'local',
            'root' => storage_path('app/chat'),
            'url' => '/storage/chat',
            'visibility' => 'private',
        ]]);
    }
}
