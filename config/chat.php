<?php

use App\Models\User;

return [

    /*
    |--------------------------------------------------------------------------
    | Chatable Models
    |--------------------------------------------------------------------------
    |
    | Every Authenticatable model allowed to participate in chat, keyed by a
    | short alias. Every chat_* table stores a polymorphic `chatable_type` /
    | `chatable_id` pair instead of a plain `user_id`, so more than one model
    | (e.g. users and support agents) can hold conversations with each other.
    | The alias — not the FQCN — is what's persisted (see morph map below),
    | so renaming a model class later doesn't orphan existing rows.
    |
    | The first entry is the default used wherever a single fallback model is
    | needed (e.g. CHAT_USER_MODEL-style env overrides, user search defaults).
    |
    | Each entry may be either a plain model class string (uses the global
    | user_search.name_field below for its display name) or an array with a
    | 'model' key plus a per-model 'name_field' override, for a chatable whose
    | display-name column differs from the rest, e.g.:
    |   'agent' => ['model' => App\Models\Agent::class, 'name_field' => 'full_name'],
    |
    */
    'chatable_models' => [
        'user' => env('CHAT_USER_MODEL', User::class),
    ],

    /*
    |--------------------------------------------------------------------------
    | Table Names
    |--------------------------------------------------------------------------
    |
    | Override any table name if it collides with something in your app.
    |
    */
    'table_names' => [
        'conversations' => 'chat_conversations',
        'conversation_participants' => 'chat_conversation_participants',
        'messages' => 'chat_messages',
        'message_deletions' => 'chat_message_deletions',
        'message_attachments' => 'chat_message_attachments',
        'message_reactions' => 'chat_message_reactions',
        'message_receipts' => 'chat_message_receipts',
        'starred_messages' => 'chat_starred_messages',
        'blocked_users' => 'chat_blocked_users',
        'user_presence' => 'chat_user_presence',
        'pinned_messages' => 'chat_pinned_messages',
        'user_settings' => 'chat_user_settings',
        'lists' => 'chat_lists',
        'list_conversations' => 'chat_list_conversations',
        'poll_votes' => 'chat_poll_votes',
        'event_rsvps' => 'chat_event_rsvps',
        'message_edits' => 'chat_message_edits',
    ],

    /*
    |--------------------------------------------------------------------------
    | Routing
    |--------------------------------------------------------------------------
    |
    | register_routes gates the JSON API + broadcast channel routes below;
    | register_ui_routes (further down, under "Bundled Chat UI") gates the
    | web/page routes and the compiled Vue widget's own views separately, so
    | a host can keep the API but disable the built-in UI, or vice versa.
    |
    */
    'register_routes' => env('CHAT_REGISTER_ROUTES', true),
    'run_migrations' => env('CHAT_RUN_MIGRATIONS', true),
    'route_prefix' => 'api/chat',
    // General ceiling for every route in this group (messages, typing, presence heartbeat,
    // attachments, etc.) — none of them had any rate limit before this, unlike link-preview's
    // own tighter throttle:10,1. A host can override this array to change or drop it.
    'middleware' => ['api', 'auth:sanctum', 'throttle:120,1'],

    /*
    |--------------------------------------------------------------------------
    | Bundled Chat UI
    |--------------------------------------------------------------------------
    |
    | The package ships a pre-built, self-contained Vue chat widget. These
    | control the page/asset routes it registers — set register_ui_routes to
    | false (or CHAT_REGISTER_UI_ROUTES=false) to disable the built-in UI
    | entirely and use only the JSON API above.
    |
    */
    'register_ui_routes' => env('CHAT_REGISTER_UI_ROUTES', true),
    'web_middleware' => ['web', 'auth'],
    'chat_route_prefix' => 'riwaaq',
    'asset_middleware' => [],
    'asset_route_prefix' => 'riwaaq/assets',

    /*
    |--------------------------------------------------------------------------
    | Iframe Embedding
    |--------------------------------------------------------------------------
    |
    | Controls the frame-ancestors policy sent with the full-page chat route
    | (riwaaq.chat.page) so a host can embed it in an <iframe>. Defaults to
    | same-origin only. Set to a space-separated origin list to allow specific
    | cross-origin hosts, or to null/false to disable the header entirely
    | (fully open embedding — opt-in only).
    |
    */
    'frame_ancestors' => "'self'",

    /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    */
    'pagination' => [
        'messages_per_page' => 50,
        'conversations_per_page' => 30,
        'users_per_page' => 20,
    ],

    /*
    |--------------------------------------------------------------------------
    | User Search
    |--------------------------------------------------------------------------
    |
    | Fallback display-name column read off a chatable model for the "new
    | chat"/"add member" pickers and for rendering participants, used for any
    | chatable_models entry that doesn't declare its own name_field above.
    | There's no equivalent avatar_field — avatars are always package-owned
    | (chat_user_settings.avatar_path, set via the profile upload endpoints),
    | never read from a column on the host's chatable model.
    |
    */
    'user_search' => [
        'name_field' => 'name',
    ],

    /*
    |--------------------------------------------------------------------------
    | Media
    |--------------------------------------------------------------------------
    */
    'media' => [
        'disk' => 'chat',
        // Only consulted when the disk above isn't already defined in the host's own
        // config/filesystems.php — see ChatServiceProvider::registerDefaultDisk().
        'disk_root' => storage_path('app/public/chat'),
        'disk_url' => '/storage/chat',
        'thumbnail_enabled' => true,
        'mime_types' => [
            'image' => ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
            'video' => ['video/mp4', 'video/quicktime', 'video/webm'],
            'audio' => ['audio/mpeg', 'audio/mp4', 'audio/ogg', 'audio/wav'],
            'voice' => ['audio/webm', 'audio/mp4', 'audio/ogg'],
            'document' => [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/zip',
                'text/plain',
            ],
        ],
        'max_sizes' => [
            'image' => 10 * 1024,
            'video' => 100 * 1024,
            'audio' => 25 * 1024,
            'voice' => 15 * 1024,
            'document' => 50 * 1024,
        ],
        // Total bytes a single chatable may have stored across every attachment they've ever
        // uploaded (attached or not) before further uploads are rejected. Null disables the
        // check entirely — opt in once you need to cap per-user storage.
        'max_storage_per_user_mb' => env('CHAT_MAX_STORAGE_PER_USER_MB'),
        // How long an uploaded-but-never-attached file (POST /attachments without a follow-up
        // message) is kept before chat:prune-orphaned-attachments removes it.
        'orphan_ttl_minutes' => 1440,
    ],

    /*
    |--------------------------------------------------------------------------
    | Presence
    |--------------------------------------------------------------------------
    */
    'presence' => [
        'heartbeat_ttl_seconds' => 60,
        'online_grace_seconds' => 90,
    ],

    /*
    |--------------------------------------------------------------------------
    | Privacy
    |--------------------------------------------------------------------------
    |
    | Default values for the per-user privacy toggles in `chat_user_settings`.
    | Sharing last-seen and read-receipts is reciprocal: a user who has hidden
    | their own also stops seeing everyone else's.
    |
    */
    'privacy' => [
        'last_seen_default' => true,
        'read_receipts_default' => true,
        'typing_indicator_default' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Typing Indicators
    |--------------------------------------------------------------------------
    */
    'typing' => [
        'ttl_seconds' => 5,
    ],

    /*
    |--------------------------------------------------------------------------
    | Disappearing Messages
    |--------------------------------------------------------------------------
    */
    'disappearing_messages' => [
        'enabled' => true,
        'default_ttl' => null,
    ],

    /*
    |--------------------------------------------------------------------------
    | Message Rules
    |--------------------------------------------------------------------------
    */
    'message' => [
        'edit_window_minutes' => 15,
        'delete_for_everyone_window_minutes' => 5,
        // Bounds body length on both send and edit. chat_messages.body is a TEXT column
        // (~64KB) with no other cap, so without this an authenticated participant could send
        // arbitrarily large bodies, each broadcast in real time to every other participant.
        'max_body_length' => 4096,
    ],

    /*
    |--------------------------------------------------------------------------
    | Notifications
    |--------------------------------------------------------------------------
    |
    | Extra notification channels appended to the default 'broadcast' channel
    | on new-message notifications. The package never depends on any push
    | SDK itself — add your own (fcm, webpush, etc.) and list it here.
    |
    */
    'notifications' => [
        'channels' => [],
    ],

    /*
    |--------------------------------------------------------------------------
    | Link Previews
    |--------------------------------------------------------------------------
    */
    'link_preview' => [
        'enabled' => true,
        'cache_ttl_minutes' => 1440,
    ],

    /*
    |--------------------------------------------------------------------------
    | Theme Overrides
    |--------------------------------------------------------------------------
    |
    | Quick, config-only tweaks — no CSS file required. Every knob theme.css
    | defines is fair game here, not just colors: radius scale (radiusSm,
    | radius, radiusLg, radiusXl), borderWidth, fontSans, fontDisplay,
    | shadow, shadowLg — anything in theme.css. Keys are camelCase and get
    | kebab-cased into the matching --chat-* custom property (fontSans =>
    | --chat-font-sans), values are raw CSS exactly as they'd appear in
    | theme.css, e.g.:
    |   'overrides' => [
    |       'accent' => '198 113 57',
    |       'radius' => '0.75rem',
    |       'fontSans' => '"Inter", sans-serif',
    |       'borderWidth' => '2px',
    |       'shadowLg' => '0 20px 40px rgba(0, 0, 0, 0.35)',
    |   ],
    |
    | For full control (every color, both themes), instead publish and
    | hand-edit the CSS file: php artisan vendor:publish --tag=chat-theme.
    | This layer is additive to that one, not a replacement — it's applied on
    | top via an inline <style> block, after both stylesheets.
    |
    | `icons` is the same idea for icon glyphs: a name => definition map (see
    | resources/js/icon-overrides.js for the shape and an example) rendered
    | as an inline <script> that seeds window.RiwaaqIconOverrides before the
    | app boots. For full control over every icon, instead publish and
    | hand-edit the JS file: php artisan vendor:publish --tag=chat-icons.
    |
    | `wallpapers` covers the wallpaper picker's background patterns/colors:
    | ['patterns' => [...], 'colors' => [...]], each a key => definition map
    | (see resources/js/wallpaper-overrides.js for the shape and an example).
    | For full control, instead publish and hand-edit the JS file:
    | php artisan vendor:publish --tag=chat-wallpapers.
    |
    */
    'theme' => [
        'overrides' => [],
        'icons' => [],
        'wallpapers' => [
            'patterns' => [],
            'colors' => [],
        ],
    ],
];
