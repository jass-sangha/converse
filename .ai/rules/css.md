---
paths:
  - 'packages/resources/css/**'
---

# Css

## Custom preflight-port rules must stay inside @layer base
app.css hand-ports a scoped subset of Tailwind's Preflight (since corePlugins.preflight is disabled) instead of using `@tailwind base`. That hand-port must be wrapped in `@layer base { ... }`.

Why: without the layer wrapper, the reset's `#converse-chat-app [type='button'] { background-color: transparent }` rule has the same specificity as any `.bg-converse-*` utility class on a `<button>`. Since it's plain CSS placed after `@tailwind utilities;` in the source, it compiles later in the stylesheet and silently wins every tie — blanking the background of every button that uses a `bg-converse-*` class (switch tracks, the sidebar "+ New" button, etc. were all invisible from this before it was fixed).

If you add more hand-ported reset/base rules to this file, put them inside the same `@layer base { }` block so Tailwind orders them before the utilities layer regardless of source position.

## Preflight-port in app.css also resets anchors — don't drop that rule
The hand-ported Preflight subset in app.css (see [[Custom preflight-port rules must stay inside @layer base]]) must include `#converse-chat-app a { color: inherit; text-decoration: inherit; }`.

Why: standard Tailwind Preflight has this rule; the original hand-port omitted it. Without it, any bare `<a>` whose color relies on inheritance (no explicit `text-*` utility class) falls back to the browser's default link-blue/underline instead of the surrounding text color — e.g. the image-previewer's "open original" icon (`stroke="currentColor"` on an unstyled `<a>`) rendered blue instead of white, and inline auto-linked URLs in message text rendered blue instead of matching the bubble text.

If you touch this reset block again, keep both the button and anchor resets — they're the two element types most likely to carry `bg-converse-*`/`stroke="currentColor"` utilities without an explicit color class.
