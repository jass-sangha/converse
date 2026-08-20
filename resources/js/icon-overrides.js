/*
 * Riwaaq chat widget icon overrides.
 * Publish this file (`php artisan vendor:publish --tag=chat-icons`) and hand-edit
 * the published copy to swap any icon without rebuilding the widget bundle — it's
 * loaded as a plain <script> before the app bundle, same idea as theme.css.
 *
 * Each key is an icon name (see resources/js/icons/defaults.js in the package
 * source for the full list of names and what they render today). Each value is
 * an object: { viewBox, attrs, inner }.
 *   - viewBox: the SVG viewBox, e.g. "0 0 24 24" (defaults to that if omitted)
 *   - attrs: extra attributes on the <svg> root, e.g. { fill: 'none', stroke:
 *     'currentColor', 'stroke-width': '2' } — use currentColor so the icon
 *     still inherits the widget's themed text/accent color automatically
 *   - inner: raw SVG markup for the icon's contents, e.g. '<path d="..."/>'
 *
 * Example — replace the "send" icon with a custom paper-plane glyph:
 *
 * window.RiwaaqIconOverrides = {
 *     send: {
 *         viewBox: '0 0 24 24',
 *         attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
 *         inner: '<path d="M4 12h15M13 6l6 6-6 6" />',
 *     },
 * };
 *
 * Leave this object empty to use every default icon as shipped.
 */
window.RiwaaqIconOverrides = window.RiwaaqIconOverrides || {};
