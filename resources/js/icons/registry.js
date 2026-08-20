/**
 * Runtime icon registry for the chat widget. Every icon the UI renders is
 * looked up here by name (see Icon.vue) instead of being inlined per
 * component, so a host app can replace any icon without rebuilding the
 * bundle — see resources/js/icon-overrides.js (publishable via
 * `php artisan vendor:publish --tag=chat-icons`) and config('chat.theme.icons')
 * for the two ways to feed overrides in.
 *
 * Each entry shape: { viewBox: string, attrs: object, inner: string }
 * `inner` is raw SVG markup (paths/circles/etc.) rendered via v-html, so an
 * override can be any valid SVG content, not just a single <path d="...">.
 */
const registry = new Map();

/**
 * @param {string} name
 * @param {{ viewBox?: string, attrs?: Record<string, string>, inner: string }} definition
 */
export function registerIcon(name, definition) {
    registry.set(name, {
        viewBox: '0 0 24 24',
        attrs: {},
        ...definition,
    });
}

/**
 * @param {Record<string, { viewBox?: string, attrs?: Record<string, string>, inner: string }>} definitions
 */
export function registerIcons(definitions) {
    Object.entries(definitions ?? {}).forEach(([name, definition]) => registerIcon(name, definition));
}

export function getIcon(name) {
    return registry.get(name) ?? null;
}
