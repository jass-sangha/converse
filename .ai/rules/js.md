---
paths:
  - 'packages/resources/js/**'
---

# Js

## useEcho() must never throw uncaught
`new Echo({ broadcaster: 'reverb', ... })` (via pusher-js) throws synchronously when Reverb isn't configured (e.g. missing key) in the current environment. Because `useEcho()` is called from inside other synchronous call sites — `useTyping().notifyTyping/stopTyping`, `App.vue`'s `onMounted`, `ChatWindow.vue`'s conversation watcher — an uncaught throw there aborts the rest of that calling function, which silently breaks unrelated features: the composer's `submit()` never reaches `send()` (messages can't be sent), `App.vue`'s `ensureSelfCached()` never runs (profile avatar/name never loads, shows "?"), and `ChatWindow`'s `load(newId)` never runs (message history never loads). `useEcho()` in `packages/resources/js/composables/useEcho.js` wraps `new Echo(...)` construction in try/catch and falls back to a `noopEcho` object (chainable no-op `.listen()`/`.whisper()`) so a missing/broken broadcasting config only disables realtime push — REST-based send/load/typing keep working. Keep that guard in place; don't let `new Echo(...)` throw uncaught again.
