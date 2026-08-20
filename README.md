# Riwaaq

A WhatsApp-style real-time chat package for Laravel. Ships conversations (private & group), rich message types, reactions, replies, forwarding, read receipts, typing indicators, presence, group admin roles, blocking, disappearing messages, search, and a push-notification extension point — as a REST API + real-time broadcasting (Reverb, Pusher, or Ably — pick whichever, switch anytime) — **plus a fully self-contained Vue 3 chat widget** pre-built and served directly by the package. No frontend build tooling required on your side; use the JSON API standalone if you'd rather bring your own client.

## Requirements

- PHP 8.2+
- Laravel 11, 12, or 13
- A broadcasting driver — pick one of [Laravel Reverb](https://reverb.laravel.com) (first-class target, self-hosted), [Pusher](https://pusher.com), or [Ably](https://ably.com); see "Broadcasting" below. Switching later is a one-line `.env` change, nothing to touch in code

Laravel Sanctum ships as a direct dependency of this package (not something you add yourself), so `composer require jass-sangha/riwaaq` is enough to get a working `auth:sanctum` guard — no `composer require laravel/sanctum` or `php artisan install:api` step, and no `bootstrap/app.php` edit either: the package's service provider pushes `EnsureFrontendRequestsAreStateful` onto the `api` middleware group itself, so same-origin cookie auth (what the bundled UI and any first-party SPA use) works out of the box. Set `SANCTUM_STATEFUL_DOMAINS` and `SESSION_DOMAIN` in `.env` to match the domain you'll serve the chat page from. If you also want Bearer-token auth for non-browser clients, run `php artisan vendor:publish --tag=sanctum-migrations && php artisan migrate` once to get the `personal_access_tokens` table, then issue tokens the normal Sanctum way.

## Installation

```bash
composer require jass-sangha/riwaaq
php artisan migrate
```

To also publish the config, views, and theme CSS for full customization in one step:

```bash
php artisan chat:install
php artisan migrate
```

Migrations run automatically and are **not** published by `chat:install` — run `php artisan vendor:publish --tag=chat-migrations` yourself if you need to edit them directly.

## Chatable models

Every `chat_*` table stores a polymorphic `chatable_type` / `chatable_id` pair rather than a plain `user_id`, so more than one Authenticatable model can hold conversations — with each other, not just within their own model. Configure which models are allowed, keyed by a short alias (persisted in `chatable_type` instead of the FQCN, via a Laravel morph map, so renaming a model class later doesn't orphan rows):

```php
// config/chat.php (publish with php artisan vendor:publish --tag=chat-config to override)
'chatable_models' => [
    'user' => App\Models\User::class,
    // A model whose display-name column differs from the global
    // user_search.name_field default gets its own name_field:
    // 'agent' => ['model' => App\Models\Agent::class, 'name_field' => 'full_name'],
],
```

Anywhere the API accepts a participant (creating a conversation, adding members, blocking someone), it takes a `{type, id}` pair using these aliases, e.g. `{"type": "user", "id": 5}`. Anywhere a chatable appears in a URL, it's `.../{type}/{id}`, e.g. `DELETE /conversations/{id}/participants/user/5`.

### Broadcasting: Reverb, Pusher, or Ably — pick one

The widget auto-detects whichever one you've set up — there's nothing broadcasting-related in `config/chat.php` to configure, it just reads your app's own `config/broadcasting.php`. Set up **one** of the three below; switching later is purely a `.env` change (`BROADCAST_CONNECTION` plus that driver's own key) — no code, no `config/chat.php`, no rebuilding the widget.

<details open>
<summary><strong>Reverb</strong> — self-hosted, no third-party account, first-class target</summary>

```bash
composer require laravel/reverb
php artisan reverb:install
php artisan reverb:start
```

`reverb:install` writes `BROADCAST_CONNECTION=reverb` plus `REVERB_APP_KEY`/`REVERB_APP_SECRET`/etc. to `.env` for you.
</details>

<details>
<summary><strong>Pusher</strong> — hosted, sign up at <a href="https://pusher.com">pusher.com</a></summary>

```bash
composer require pusher/pusher-php-server
```

```env
BROADCAST_CONNECTION=pusher
PUSHER_APP_ID=your-app-id
PUSHER_APP_KEY=your-app-key
PUSHER_APP_SECRET=your-app-secret
PUSHER_APP_CLUSTER=your-cluster
```
</details>

<details>
<summary><strong>Ably</strong> — hosted, sign up at <a href="https://ably.com">ably.com</a></summary>

```bash
composer require ably/ably-php
```

```env
BROADCAST_CONNECTION=ably
ABLY_KEY=your-ably-key
```

Ably has no dedicated Echo/pusher-js connector of its own — the widget talks to it over Ably's [Pusher-compatible endpoint](https://ably.com/docs/broadcast/laravel), which is built into `useEcho.js` already. No extra frontend package or config needed beyond `ABLY_KEY` above.
</details>

If `BROADCAST_CONNECTION` is left unset or pointed at something the widget doesn't recognize (e.g. Laravel's own out-of-the-box default of `log`), it auto-detects instead: Reverb, then Pusher, then Ably, whichever has a key configured — so as long as exactly one of the three is set up, the widget works without `BROADCAST_CONNECTION` needing to be set explicitly at all.

Conversations broadcast on **presence channels** (`presence-conversation.{id}`), authorized in the package's `routes/channels.php`. Presence channels let clients see who's currently viewing a chat for free, and let the frontend `whisper()` typing events peer-to-peer through your broadcaster — the backend never sees or stores a typing event unless you use the REST fallback (`POST /conversations/{id}/typing`).

```js
// Example Echo usage in a consuming frontend
Echo.join(`conversation.${conversationId}`)
    .here((users) => {
        /* who's currently viewing */
    })
    .listen(".message.sent", (e) => {
        /* new message */
    })
    .listen(".messages.read", (e) => {
        /* read receipt */
    })
    .listenForWhisper("typing", (e) => {
        /* peer typed, zero backend cost */
    });
```

## Configuration

Key options in `config/chat.php`:

| Key                                                                         | Purpose                                                                                                                                            |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `chatable_models`                                                           | Alias => Authenticatable model map of who's allowed to participate in chat, optionally with a per-model `name_field` (see "Chatable models" above) |
| `table_names`                                                               | Override any table name if it collides with your app                                                                                               |
| `register_routes` / `register_ui_routes`                                    | Toggle the JSON API + broadcast channels, and the web page/widget routes, independently                                                            |
| `route_prefix` / `middleware`                                               | Where the API mounts and what protects it (default `api/chat`, `['api','auth:sanctum']`)                                                           |
| `media.disk`                                                                | Filesystem disk for attachments/avatars (defaults to a package-registered local disk; override in `config/filesystems.php` to switch to S3 etc.)   |
| `media.disk_root` / `media.disk_url`                                        | Location of the package's auto-registered disk, when `media.disk` isn't already defined in your own `config/filesystems.php`                       |
| `media.mime_types` / `media.max_sizes`                                      | Per-message-type upload validation                                                                                                                 |
| `presence.*`, `typing.ttl_seconds`                                          | Heartbeat/online-grace/typing-decay tuning                                                                                                         |
| `message.edit_window_minutes`, `message.delete_for_everyone_window_minutes` | `null` = unlimited                                                                                                                                 |
| `disappearing_messages.*`                                                   | Enable/default TTL for auto-vanishing messages                                                                                                     |
| `notifications.channels`                                                    | Extra notification channels appended to `broadcast` (see below)                                                                                    |
| `theme.overrides`                                                           | Config-only color/border-radius tweaks, no CSS file required (see "Theming" below)                                                                 |
| `frame_ancestors`                                                           | Frame policy for embedding the full page in an `<iframe>` (see "Iframe embedding" below)                                                           |

## API surface

All routes are prefixed with `config('chat.route_prefix')` (default `api/chat`).

**Conversations** — `GET|POST /conversations`, `GET|PATCH /conversations/{id}`, `POST /conversations/{id}/avatar`, `PATCH /conversations/{id}/{mute,archive,pin,disappearing}`, `POST /conversations/{id}/leave`

**Participants** — `GET|POST /conversations/{id}/participants`, `DELETE /conversations/{id}/participants/{type}/{id}`, `PATCH /conversations/{id}/participants/{type}/{id}/role`

**Messages** — `GET|POST /conversations/{id}/messages`, `PATCH|DELETE /messages/{id}`, `DELETE /messages/{id}/me`, `POST /messages/{id}/forward`, `GET /messages/search`

**Reactions & starring** — `POST|DELETE /messages/{id}/reactions`, `GET /starred-messages`, `POST|DELETE /messages/{id}/star`

**Receipts, typing, presence** — `POST /conversations/{id}/receipts/{delivered,read}`, `POST /conversations/{id}/typing`, `POST /presence/heartbeat`, `GET /users/{type}/{id}/presence`

**Blocking** — `GET|POST /blocked-users`, `DELETE /blocked-users/{type}/{id}`

**Media & link previews** — `POST /attachments`, `POST /link-preview`

**People search** — `GET /users?q=` (search by each chatable's `name_field`, excludes yourself) / `GET /users?ids[]=1&ids[]=2` (batch-resolve display info for known participant ids) — used to power "new chat"/"add member" pickers; the package can't assume your user schema, so this is deliberately minimal (`{id, name, avatar_url}`) and configurable via `chat.user_search.name_field` (global default) or a per-model override in `chat.chatable_models` (see "Chatable models" above). `avatar_url` is always package-owned — see `chat_user_settings` — never read from a column on your own model.

## Bundled Chat UI

The package ships a complete, pre-built Vue 3 + Tailwind chat widget — no `npm install`, no Vite config, no Vue in your own app required. It's served directly by the package's own routes.

Once installed and migrated, visit:

```
GET /riwaaq/chat
```

behind your app's normal `web` + `auth` middleware (configurable via `chat.web_middleware`, default `['web', 'auth']`). The page authenticates via Sanctum's same-origin session-cookie flow (no token is ever embedded in the page) and talks to the JSON API described above over `axios` with `withCredentials`.

It covers the full feature set: conversation list with search/pin/archive/mute, new chat/group creation, every message type (text, image, video, audio, voice notes via `MediaRecorder`, documents, location, contact cards), replies, reactions, forwarding, starred messages, group admin (add/remove/promote/demote, surfaces the sole-admin guard as an inline error), blocked-users management, disappearing-messages toggle, link previews, typing indicators, read receipts, and live presence — including live push when someone starts a new chat with you or adds you to a group (`ConversationCreated`/`ParticipantAdded` broadcast onto your personal `private-user.{id}` channel).

To disable the bundled UI entirely and expose only the JSON API (e.g. you're building your own React/mobile client), set `chat.register_ui_routes` to `false` in `config/chat.php` (or `CHAT_REGISTER_UI_ROUTES=false` in `.env` if you haven't published the config):

```php
'register_ui_routes' => false,
```

Relevant config: `chat.web_middleware`, `chat.chat_route_prefix` (default `riwaaq`), `chat.asset_middleware`, `chat.asset_route_prefix` (default `riwaaq/assets`).

If you ever need to modify the widget's source, it lives in `resources/js/` (Vue SFCs) and `resources/css/` (Tailwind) inside the package, with its own `package.json`/`vite.config.js`/`tailwind.config.js`. Run `npm install && npm run build` inside the package directory to regenerate the committed `resources/dist/app.{js,css}` bundle the `AssetController` serves.

### Embedding inside your own layout

Drop the widget directly into any Blade view — no iframe, no separate page:

```blade
<div style="height: 640px">
    <x-chat::widget />
</div>
```

The widget fills its parent container's size (not the browser viewport), so the parent **must** have an explicit CSS height, or it collapses to zero. Its CSS is fully scoped to its own mount element (`#riwaaq-chat-app`) — dropping it in won't affect the rest of your page's styling, and your page's own styles/Tailwind setup won't affect it either. Only one instance is supported per page. It shares the exact same compiled `resources/dist/app.{js,css}` bundle as the full-page route — no separate build.

### Theming

Three levels of control, from lightest to heaviest:

1. **`chat.theme.overrides` config** — quick single-token tweaks, no CSS file needed:
    ```php
    'theme' => ['overrides' => ['accent' => '198 113 57', 'radius' => '0.75rem']],
    ```
2. **Publish and hand-edit the theme CSS** — every color, both light/dark, full control:
    ```bash
    php artisan vendor:publish --tag=chat-theme
    # then edit public/vendor/chat/theme.css
    ```
3. Both apply together — config overrides win, since they're injected last.

### Iframe embedding

If you'd rather iframe the full-page route than use the native `<x-chat::widget />` embed above:

```blade
<iframe src="{{ route('riwaaq.chat.page') }}" style="width:100%;height:100%;border:0" title="Chat"></iframe>
```

The `chat.frame_ancestors` config (default `"'self'"`) controls who's allowed to frame it — same-origin only by default. Set it to a space-separated list of origins for cross-origin embedding, or to `null`/`false` to disable the header entirely. The page also posts its content height to the parent window via `postMessage` (`{source: 'riwaaq-chat', height}`) whenever it's actually running inside an iframe, so you can auto-size the iframe instead of hardcoding a height. Cross-_origin_ iframe embedding additionally needs `SESSION_SAME_SITE=none` and a secure-cookie setup in your own app's session config — same-origin embedding needs no session changes at all.

#### Fixed-height container (no `postMessage` needed)

If the iframe already sits inside a container with a definite height — a dashboard content area, a flex layout with `h-full`, a modal with a fixed size — skip the `postMessage` auto-resize listener entirely and just size the iframe with CSS to fill its parent:

```tsx
// React example (Inertia page, Tailwind)
export default function RiwaaqChat() {
    return (
        <div className="flex h-full flex-1 flex-col p-4">
            <iframe
                src="/riwaaq/chat"
                title="Chat"
                className="h-full w-full flex-1 rounded-xl border"
            />
        </div>
    );
}
```

This is simpler whenever you control the surrounding layout. Reach for the auto-resize snippets below only when the iframe needs to grow with its content instead — e.g. embedding it inline in a page with no fixed-height region around it.

#### Framework snippets (auto-resize via `postMessage`)

There's no npm package to install for any of these — the widget stays entirely server-side, you're just pointing an `<iframe>` at `route('riwaaq.chat.page')` and wiring up the auto-resize `postMessage` listener in whatever framework your host app uses. Each snippet below is the whole component.

**Plain HTML / vanilla JS**

```html
<iframe
    id="riwaaq-chat"
    src="/riwaaq/chat"
    style="width:100%;border:0;height:100%"
    title="Chat"
></iframe>
<script>
    window.addEventListener("message", (e) => {
        if (e.data?.source === "riwaaq-chat") {
            document.getElementById("riwaaq-chat").style.height =
                e.data.height + "px";
        }
    });
</script>
```

**React**

```jsx
import { useEffect, useRef } from "react";

interface RiwaaqChatMessage {
    source: "riwaaq-chat";
    height: number;
}

export default function RiwaaqChat({ src = "/riwaaq/chat" }: { src?: string }) {
    const frameRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        function onMessage(e: MessageEvent<RiwaaqChatMessage>) {
            if (e.data?.source === "riwaaq-chat" && frameRef.current) {
                frameRef.current.style.height = `${e.data.height}px`;
            }
        }
        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, []);

    return (
        <iframe
            ref={frameRef}
            src={src}
            style={{ width: "100%", border: 0, height: "100%" }}
            title="Chat"
        />
    );
}
```

**Vue 3**

```vue
<template>
    <iframe
        ref="frame"
        :src="src"
        style="width:100%;border:0;height:100%"
        title="Chat"
    />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({ src: { type: String, default: "/riwaaq/chat" } });
const frame = ref(null);

function onMessage(e) {
    if (e.data?.source === "riwaaq-chat" && frame.value) {
        frame.value.style.height = `${e.data.height}px`;
    }
}

onMounted(() => window.addEventListener("message", onMessage));
onUnmounted(() => window.removeEventListener("message", onMessage));
</script>
```

**Angular**

```ts
import {
    Component,
    ElementRef,
    HostListener,
    Input,
    ViewChild,
} from "@angular/core";

@Component({
    selector: "riwaaq-chat",
    template: `<iframe
        #frame
        [src]="src"
        style="width:100%;border:0;height:100%"
        title="Chat"
    ></iframe>`,
})
export class RiwaaqChatComponent {
    @Input() src = "/riwaaq/chat";
    @ViewChild("frame") frame!: ElementRef<HTMLIFrameElement>;

    @HostListener("window:message", ["$event"])
    onMessage(e: MessageEvent) {
        if (e.data?.source === "riwaaq-chat") {
            this.frame.nativeElement.style.height = `${e.data.height}px`;
        }
    }
}
```

**Svelte**

```svelte
<script>
    export let src = '/riwaaq/chat';
    let frame;

    function onMessage(e) {
        if (e.data?.source === 'riwaaq-chat' && frame) {
            frame.style.height = `${e.data.height}px`;
        }
    }
</script>

<svelte:window on:message={onMessage} />
<iframe bind:this={frame} {src} style="width:100%;border:0;height:100%" title="Chat" />
```

All five assume the frontend is served from the **same origin** as the Laravel app (so the Sanctum session cookie authenticates the iframe for free) and that `src`/`route('riwaaq.chat.page')` resolves to that same origin — swap in an absolute URL plus the cross-origin `frame_ancestors`/`SESSION_SAME_SITE` config above if it isn't.

## Scheduled commands

Register these in your app's scheduler (`routes/console.php` on Laravel 11/12):

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('chat:sweep-presence')->everyMinute();
Schedule::command('chat:prune-expired-messages')->everyFiveMinutes();
```

- `chat:sweep-presence` marks users offline once their heartbeat TTL + grace period has elapsed, broadcasting `PresenceChanged` to their active conversations.
- `chat:prune-expired-messages` permanently deletes disappearing messages whose `expires_at` has passed.

## Extension points

The package intentionally ships **zero dependency** on media-processing or push-notification SDKs — bind your own implementation in your `AppServiceProvider`.

### Real thumbnails / durations

```php
use Riwaaq\Chat\Contracts\MediaProcessor;
use Riwaaq\Chat\Models\MessageAttachment;

class FfmpegMediaProcessor implements MediaProcessor
{
    public function supports(string $mimeType): bool
    {
        return str_starts_with($mimeType, 'video/') || str_starts_with($mimeType, 'audio/');
    }

    public function process(MessageAttachment $attachment): array
    {
        // ...run ffmpeg/getid3, return ['width'=>..,'height'=>..,'duration_seconds'=>..,'thumbnail_path'=>..]
    }
}

$this->app->bind(MediaProcessor::class, FfmpegMediaProcessor::class);
```

### Push notifications (FCM/APNs/WebPush)

`NewChatMessageNotification` ships with only the `broadcast` channel wired. To add real push:

```php
// config/chat.php
'notifications' => ['channels' => ['fcm']],
```

```php
// Extend or replace the notification with your own toFcm()/toWebPush() method,
// or just listen to the domain event directly for full control:
use Riwaaq\Chat\Events\MessageSent;

Event::listen(MessageSent::class, function (MessageSent $event) {
    // dispatch your own push notification however you like
});
```

### Link previews

The default `OpenGraphLinkPreviewFetcher` does a simple OG-tag scrape. Bind `Riwaaq\Chat\Contracts\LinkPreviewFetcher` to your own implementation (e.g. a dedicated unfurling service) if you need more than that.

## Testing

```bash
composer install
vendor/bin/pest
```

Built on Orchestra Testbench — no host Laravel app required to run the package's own test suite.

## License

MIT
