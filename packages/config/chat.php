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
    ],

    /*
    |--------------------------------------------------------------------------
    | Routing
    |--------------------------------------------------------------------------
    */
    'register_routes' => true,
    'run_migrations' => true,
    'route_prefix' => 'api/chat',
    'middleware' => ['api', 'auth:sanctum'],

    /*
    |--------------------------------------------------------------------------
    | Bundled Chat UI
    |--------------------------------------------------------------------------
    |
    | The package ships a pre-built, self-contained Vue chat widget. These
    | control the page/asset routes it registers — set CHAT_REGISTER_UI_ROUTES=false
    | to disable the built-in UI entirely and use only the JSON API above.
    |
    */
    'web_middleware' => ['web', 'auth'],
    'chat_route_prefix' => 'converse',
    'asset_middleware' => [],
    'asset_route_prefix' => 'converse/assets',

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
    | Fields read (via optional attribute access) off `chat.user_model` to
    | resolve a display name/avatar for the "new chat"/"add member" pickers
    | and for rendering participants — the package can't assume the host's
    | user schema beyond these two configurable field names.
    |
    */
    'user_search' => [
        'name_field' => 'name',
        'avatar_field' => 'avatar',
    ],

    /*
    |--------------------------------------------------------------------------
    | Media
    |--------------------------------------------------------------------------
    */
    'media' => [
        'disk' => 'chat',
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
        'delete_for_everyone_window_minutes' => null,
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
];
