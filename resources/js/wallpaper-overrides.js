/*
 * Riwaaq chat widget wallpaper (background pattern/color) overrides.
 * Publish this file (`php artisan vendor:publish --tag=chat-wallpapers`) and hand-edit
 * the published copy to add or replace any pattern/color in the wallpaper picker
 * without rebuilding the widget bundle — it's loaded as a plain <script> before the
 * app bundle, same idea as theme.css and icon-overrides.js.
 *
 * Two keys, each an object keyed by a pattern/color key (the key doubles as the id
 * stored per-conversation, so don't rename an existing one out from under users who
 * already picked it — add a new key instead):
 *   - patterns: { key: { label, image, size, preview? } } — `image`/`size` are raw CSS
 *     background-image/background-size values; `preview` (optional) is a smaller-scale
 *     override of either for the ~40px picker swatch (defaults to `image`/`size`).
 *   - colors: { key: { label, css } } — `css` is any valid CSS color/gradient value.
 *
 * Overriding an existing key (e.g. "default") replaces it in place; a new key is
 * appended to the end of the picker list. Use `rgb(var(--chat-text) / .16)`-style theme
 * tokens (see theme.css) rather than fixed colors so a pattern still re-tints correctly
 * between light and dark.
 *
 * Example — add a "Waves" pattern and a "Brand" color:
 *
 * window.RiwaaqWallpaperOverrides = {
 *     patterns: {
 *         waves: {
 *             label: 'Waves',
 *             image: 'repeating-radial-gradient(circle at 0 0, transparent 0, rgb(var(--chat-text) / .12) 20px)',
 *             size: '40px 40px',
 *         },
 *     },
 *     colors: {
 *         brand: { label: 'Brand', css: 'rgb(198 113 57 / .14)' },
 *     },
 * };
 *
 * Leave this object empty to use every default pattern/color as shipped.
 */
window.RiwaaqWallpaperOverrides = window.RiwaaqWallpaperOverrides || {};
