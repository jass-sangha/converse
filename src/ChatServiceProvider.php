<?php

namespace Converse\Chat;

use Converse\Chat\Console\Commands\InstallCommand;
use Converse\Chat\Console\Commands\PruneExpiredMessagesCommand;
use Converse\Chat\Console\Commands\SweepPresenceCommand;
use Converse\Chat\Contracts\AttachmentServiceInterface;
use Converse\Chat\Contracts\BlockedUserServiceInterface;
use Converse\Chat\Contracts\ChatListServiceInterface;
use Converse\Chat\Contracts\ConversationRepositoryInterface;
use Converse\Chat\Contracts\ConversationServiceInterface;
use Converse\Chat\Contracts\EventRsvpServiceInterface;
use Converse\Chat\Contracts\LinkPreviewFetcher;
use Converse\Chat\Contracts\MediaProcessor;
use Converse\Chat\Contracts\MessageReactionServiceInterface;
use Converse\Chat\Contracts\MessageReceiptServiceInterface;
use Converse\Chat\Contracts\MessageRepositoryInterface;
use Converse\Chat\Contracts\MessageServiceInterface;
use Converse\Chat\Contracts\ParticipantRepositoryInterface;
use Converse\Chat\Contracts\ParticipantServiceInterface;
use Converse\Chat\Contracts\PinnedMessageServiceInterface;
use Converse\Chat\Contracts\PollVoteServiceInterface;
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
use Converse\Chat\Services\ChatListService;
use Converse\Chat\Services\ConversationService;
use Converse\Chat\Services\EventRsvpService;
use Converse\Chat\Services\MessageReactionService;
use Converse\Chat\Services\MessageReceiptService;
use Converse\Chat\Services\MessageService;
use Converse\Chat\Services\NullMediaProcessor;
use Converse\Chat\Services\OpenGraphLinkPreviewFetcher;
use Converse\Chat\Services\ParticipantService;
use Converse\Chat\Services\PinnedMessageService;
use Converse\Chat\Services\PollVoteService;
use Converse\Chat\Services\PresenceService;
use Converse\Chat\Services\StarredMessageService;
use Converse\Chat\Services\UserSearchService;
use Converse\Chat\Services\UserSettingsService;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Support\Facades\Blade;
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
        ChatListServiceInterface::class => ChatListService::class,
        PollVoteServiceInterface::class => PollVoteService::class,
        EventRsvpServiceInterface::class => EventRsvpService::class,
    ];

    protected array $policies = [
        Conversation::class => ConversationPolicy::class,
        Message::class => MessagePolicy::class,
    ];

    public function configurePackage(Package $package): void
    {
        // Spatie's own hasConfigFile() merge (via registerPackageConfigs()) runs after this
        // method, so the config()-driven gates below would only ever see unpublished defaults
        // as null without merging it ourselves first. Idempotent — Spatie's later automatic
        // merge is a no-op once these keys already exist, and a host's own published config
        // values still win either way (mergeConfigFrom keeps existing keys over defaults). The
        // gates themselves read env(...) INSIDE config/chat.php (matching chatable_models'
        // existing convention), not as a config()-read-site fallback — once merged, the config
        // key always exists, so a fallback given only at the read site would never be reached.
        $this->mergeConfigFrom(__DIR__.'/../config/chat.php', 'chat');

        $package->name('chat')->hasConfigFile();

        if ((bool) config('chat.run_migrations', true)) {
            // discoversMigrations() (not hasMigrations()) preserves the timestamp-prefixed
            // filenames' natural sort order, which matters here since several tables have
            // foreign keys to earlier ones — hasMigrations() sorts by the bare name instead,
            // which silently breaks creation order (tolerated by SQLite, fatal on MySQL/Postgres).
            $package->discoversMigrations()->runsMigrations();
        }

        if ((bool) config('chat.register_routes', true)) {
            $package->hasRoutes(['api', 'channels']);
        }

        if ((bool) config('chat.register_ui_routes', true)) {
            $package->hasRoutes('web')->hasViews();
        }

        $package->hasCommands([SweepPresenceCommand::class, PruneExpiredMessagesCommand::class, InstallCommand::class]);
    }

    public function packageBooted(): void
    {
        foreach ($this->policies as $model => $policy) {
            Gate::policy($model, $policy);
        }

        Relation::enforceMorphMap(Chat::chatableModels());

        // hasViews()'s loadViewsFrom() (called above via configurePackage()) registers the
        // "chat::" view namespace, but Blade's <x-prefix::name /> component-tag compiler only
        // consults namespaces registered here — without this, <x-chat::widget /> throws
        // "Unable to locate a class or view for component [chat::widget]".
        Blade::anonymousComponentNamespace('chat::components', 'chat');

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
            // Defaults nested under app/public (not app/chat) so it resolves through the
            // standard public/storage symlink — the framework's dev-server storage.local route
            // 403s any path outside app/public, and there's no other route in this package that
            // serves media, so avatars/attachments would 403 on any disk root that isn't
            // reachable that way. A host overriding chat.media.disk_root/disk_url is responsible
            // for keeping that same guarantee (a symlink or an equivalent serving route).
            'root' => config('chat.media.disk_root', storage_path('app/public/chat')),
            'url' => config('chat.media.disk_url', '/storage/chat'),
            'visibility' => 'public',
        ]]);
    }
}
