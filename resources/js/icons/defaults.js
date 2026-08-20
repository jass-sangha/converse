/**
 * Default icon set for the chat widget, registered at boot in app.js before
 * any host overrides are applied (see icons/registry.js and icon-overrides.js).
 * Extracted from what were previously inline <svg> blocks in each component,
 * so a host can replace any of them without rebuilding the bundle.
 *
 * @type {Record<string, { viewBox?: string, attrs?: Record<string, string>, inner: string }>}
 */
export const defaultIcons = {
    // Shared stroke-style icon attrs used by several entries below.
    smile: {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.4', 'stroke-linecap': 'round' },
        inner: '<circle cx="12" cy="12" r="8.5" /><path d="M9 14.5c.8 1 1.8 1.5 3 1.5s2.2-.5 3-1.5M9 9.5h.01M15 9.5h.01" />',
    },
    'more-vertical': {
        attrs: { fill: 'currentColor' },
        inner: '<circle cx="12" cy="5" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="12" cy="19" r="1.8" />',
    },
    plus: {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6Z" />',
    },
    pin: {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M16 3v6.5l2 3V15h-6v6l-1 1-1-1v-6H4v-2.5l2-3V3Z" />',
    },
    star: {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M12 2 15 9l7 .6-5.3 4.6L18.2 21 12 17.3 5.8 21l1.5-6.8L2 9.6 9 9Z" />',
    },
    info: {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M11 7h2v2h-2Zm0 4h2v6h-2Zm1-9a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z" />',
    },
    reply: {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M10 9V4.5L2 12l8 7.5V15c5.2 0 8.8 1.7 11.4 5.3-1-5.2-4.1-10.3-11.4-11.3Z" />',
    },
    copy: {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11Z" />',
    },
    'smile-face': {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-3.5 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 17c-2.5 0-4.6-1.5-5.4-3.6h10.8C16.6 15.5 14.5 17 12 17Z" />',
    },
    forward: {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M14 9V4.5l8 7.5-8 7.5V15c-5.2 0-8.8 1.7-11.4 5.3 1-5.2 4.1-10.3 11.4-11.3Z" />',
    },
    edit: {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25ZM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z" />',
    },
    trash: {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M9 3v1H4v2h16V4h-5V3H9Zm-3 6 1 12h10l1-12H6Z" />',
    },
    heart: {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M12 21.35 10.55 20C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A6.02 6.02 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54Z" />',
    },
    'trash-alt': {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M15 4V3H9v1H4v2h16V4h-5ZM6 8l1 12h10l1-12H6Z" />',
    },
    block: {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2c1.85 0 3.55.63 4.9 1.69L5.69 16.9A7.94 7.94 0 0 1 4 12a8 8 0 0 1 8-8Zm0 16c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1A7.94 7.94 0 0 1 20 12a8 8 0 0 1-8 8Z" />',
    },
    leave: {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M10 3v2H5v14h5v2H3V3h7Zm5.29 3.71L18.59 10H8v2h10.59l-3.3 3.29 1.42 1.42L22 11.41l-5.29-5.3-1.42 1.6Z" />',
    },
    bell: {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6-1.6-1.6V10a5.4 5.4 0 0 0-4.5-5.32V3.5a1 1 0 1 0-2 0v1.18A5.4 5.4 0 0 0 6.4 10v4.4L4.8 16v1h14.4v-1Z" />',
    },
    'bell-muted': {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6-1.6-1.6V10a5.4 5.4 0 0 0-4.5-5.32V3.5a1 1 0 1 0-2 0v1.18A5.4 5.4 0 0 0 6.4 10v4.4L4.8 16v1h14.4v-1Z" /><path d="M3.5 3.5l17 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none" />',
    },
    mic: {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" />',
    },
    'mic-muted': {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" /><path d="M3.5 3.5l17 17" />',
    },
    stop: {
        attrs: { fill: 'currentColor' },
        inner: '<rect x="5" y="5" width="14" height="14" rx="2" />',
    },
    pause: {
        attrs: { fill: 'currentColor' },
        inner: '<rect x="6.5" y="5" width="4" height="14" rx="1.4" /><rect x="13.5" y="5" width="4" height="14" rx="1.4" />',
    },
    play: {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M8 5.5l11 6.5-11 6.5Z" />',
    },
    'paper-plane': {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M2 21 23 12 2 3v7l15 2-15 2Z" />',
    },
    send: {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<path d="M4 12h15M13 6l6 6-6 6" />',
    },
    minimize: {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<path d="M5 14h6v6M19 10h-6V4" />',
    },
    phone: {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<path d="M4.5 3.5h3.6l1.6 4-2.2 1.6a12.5 12.5 0 0 0 5.4 5.4l1.6-2.2 4 1.6v3.6a2 2 0 0 1-2.2 2A16.8 16.8 0 0 1 2.5 5.7a2 2 0 0 1 2-2.2Z" />',
    },
    'phone-accept': {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z" />',
    },
    camera: {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<rect x="2.5" y="6" width="13" height="12" rx="3.5" /><path d="M15.5 11l6-3.5v9L15.5 13" />',
    },
    'camera-off': {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<rect x="2.5" y="6" width="13" height="12" rx="3.5" /><path d="M15.5 11l6-3.5v9L15.5 13" /><path d="M3.5 20.5 20.5 3.5" />',
    },
    speaker: {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4Z" /><path d="M16 9.5a4.5 4.5 0 0 1 0 5M19 7a8 8 0 0 1 0 10" />',
    },
    'speaker-off': {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4Z" /><path d="M16 9.5a4.5 4.5 0 0 1 0 5M19 7a8 8 0 0 1 0 10" /><path d="M3.5 3.5l17 17" />',
    },
    mute: {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.4', 'stroke-linecap': 'round' },
        inner: '<path d="M18 16v-5a6 6 0 0 0-4.6-5.8M6 11v5l-2 2h13" /><path d="M3 3l18 18" />',
    },
    'heart-outline': {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.4', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<path d="M12 20s-7-4.4-7-9a3.9 3.9 0 0 1 7-2.4A3.9 3.9 0 0 1 19 11c0 4.6-7 9-7 9Z" />',
    },
    'heart-solid': {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M12 20s-7-4.4-7-9a3.9 3.9 0 0 1 7-2.4A3.9 3.9 0 0 1 19 11c0 4.6-7 9-7 9Z" />',
    },
    'map-pin-outline': {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.4', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<path d="M8 8a4 4 0 1 1 8 0 4 4 0 0 1-8 0ZM12 13v8" />',
    },
    'map-pin-solid': {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M8 8a4 4 0 1 1 8 0 4 4 0 0 1-8 0ZM8.6 13h6.8L12 21Z" />',
    },
    ring: {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.4', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<circle cx="12" cy="12" r="9" />',
    },
    'ring-dot': {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.4', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none" />',
    },
    archive: {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.4', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<path d="M3 4h18v4H3zM5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8M10 13h4" />',
    },
    download: {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<path d="M12 4v11M7.5 11l4.5 4.5 4.5-4.5M5 20h14" />',
    },
    close: {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M18.3 5.71 12 12l6.3 6.29-1.41 1.42L10.59 13.4 4.3 19.7 2.9 18.3 9.19 12 2.9 5.71 4.3 4.29l6.3 6.3 6.29-6.3Z" />',
    },
    'close-alt': {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M18.3 5.71 12 12.01l6.3 6.3-1.41 1.41L10.59 13.4l-6.3 6.3-1.41-1.42 6.3-6.3-6.3-6.29L4.3 4.28l6.29 6.3 6.3-6.3Z" />',
    },
    'chevron-left': {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M15.4 7.4 14 6l-6 6 6 6 1.4-1.4L10.8 12Z" />',
    },
    'chevron-right': {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M8.6 7.4 10 6l6 6-6 6-1.4-1.4L14.2 12Z" />',
    },
    document: {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" /><path d="M14 3v5h5" />',
    },
    file: {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm8 1.5V8h4.5L14 3.5Z" />',
    },
    'smile-outline': {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.75', 'stroke-linecap': 'round' },
        inner: '<circle cx="12" cy="12" r="9" /><path d="M8.5 14.5c.9 1.2 2.1 1.8 3.5 1.8s2.6-.6 3.5-1.8" /><path d="M9 9.5h.01M15 9.5h.01" />',
    },
    eye: {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" /><circle cx="12" cy="12" r="3" />',
    },
    'camera-solid': {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M9 4 7.5 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.5L15 4Zm3 5a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />',
    },
    upload: {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<path d="M12 20V9" /><path d="M7.5 13.5 12 9l4.5 4.5" /><path d="M5 4h14" />',
    },
    back: {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12Z" />',
    },
    'video-camera': {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<rect x="2.5" y="6" width="13" height="12" rx="3" /><path d="M15.5 11l6-3.2v8.4l-6-3.2Z" />',
    },
    search: {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z" />',
    },
    slash: {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round' },
        inner: '<path d="M4 4l16 16" />',
    },
    droplet: {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.25', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<path d="M12 3c-3.5 4-6.5 8-6.5 11.5a6.5 6.5 0 0 0 13 0C18.5 11 15.5 7 12 3Z" />',
    },
    image: {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.25', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<rect x="3" y="4" width="18" height="16" rx="4" /><circle cx="8.5" cy="9.5" r="1.4" /><path d="M4 17l4.5-5 4 4 2.5-2.5L20 17" />',
    },
    'search-outline': {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.75', 'stroke-linecap': 'round' },
        inner: '<circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" />',
    },
    link: {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M3.9 12a4.1 4.1 0 0 1 4.1-4.1h4v-2h-4a6.1 6.1 0 0 0 0 12.2h4v-2h-4A4.1 4.1 0 0 1 3.9 12ZM8 13h8v-2H8Zm8-6h-4v2h4a4.1 4.1 0 0 1 0 8.2h-4v2h4a6.1 6.1 0 0 0 0-12.2Z" />',
    },
    'chat-bubble': {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12Z" />',
    },
    gallery: {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<rect x="3" y="4" width="18" height="16" rx="4" /><circle cx="9" cy="10" r="1.8" /><path d="m4 17 5-4 4 3 3-2 4 3" />',
    },
    settings: {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<circle cx="12" cy="12" r="3.2" /><path d="M19.4 14.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.9 2.9l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-3-1.3l-.1.1a2 2 0 1 1-2.9-2.9l.1-.1a1.7 1.7 0 0 0-1.2-2.9h-.2a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.3-3l-.1-.1a2 2 0 1 1 2.9-2.9l.1.1a1.7 1.7 0 0 0 2.9-1.2v-.2a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 3 1.3l.1-.1a2 2 0 1 1 2.9 2.9l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1Z" />',
    },
    clock: {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22Zm1 11h5v2h-7V6h2Z" />',
    },
    'read-tick-sending': {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.5', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" />',
    },
    'read-tick-sent': {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<path d="M9 13l3.5 3.5L20 8" />',
    },
    'read-tick-read': {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<path d="M2 13l3.5 3.5L12 10" /><path d="M9 13l3.5 3.5L20 8" />',
    },
    'chat-bubble-alt': {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.5 9.5 0 0 1-2.8-.4L4 21l1.6-4.2A8.3 8.3 0 0 1 3 11.5 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z" />',
    },
    'image-alt': {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<rect x="3" y="4" width="18" height="16" rx="4" /><circle cx="8.5" cy="9.5" r="1.6" /><path d="M4 17l4.5-5 4 4 2.5-2.5L20 17" />',
    },
    paperclip: {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<path d="M21 12.5 12.8 20.7a5 5 0 0 1-7.1-7.1L14 5.3a3.4 3.4 0 0 1 4.8 4.8l-8.2 8.2a1.8 1.8 0 0 1-2.5-2.5l7.6-7.6" />',
    },
    'close-outline': {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.75', 'stroke-linecap': 'round' },
        inner: '<path d="M6 6l12 12M18 6L6 18" />',
    },
    'play-overlay': {
        attrs: { fill: 'white' },
        inner: '<path d="M8 5.5l11 6.5-11 6.5Z" />',
    },
    poll: {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M4 4h2v16H4Zm14 6h2v10h-2Zm-7-3h2v13h-2Z" />',
    },
    check: {
        attrs: { fill: 'currentColor' },
        inner: '<path d="m9 16.2-3.5-3.6L4 14.1l5 5 11-11-1.4-1.4Z" />',
    },
    'double-check': {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M18 7 9.5 15.5 5 11l1.4-1.4 3.1 3.1L16.6 5.6Zm-5 0L8.5 11.5 5 8l1.4-1.4L8.5 8.7l3.1-3.1Z" />',
    },
    'plus-outline': {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.75', 'stroke-linecap': 'round' },
        inner: '<path d="M12 5v14M5 12h14" />',
    },
    'check-alt': {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41Z" />',
    },
    'chevron-down': {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<path d="M6 10l6 6 6-6" />',
    },
    calendar: {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2Zm-2 8h14v10H5Z" />',
    },
    'location-pin': {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />',
    },
    timer: {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm0-18a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z" /><path d="M13 7h-2v6l5.2 3.2 1-1.6-4.2-2.5V7Z" />',
    },
    user: {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-3.87 0-8 1.95-8 5v2h16v-2c0-3.05-4.13-5-8-5Z" />',
    },
    'edit-outline': {
        attrs: { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.75', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        inner: '<path d="M4 20h4L20 8l-4-4L4 16v4Z" />',
    },
    'more-vertical-alt': {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm0 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z" />',
    },
    'back-arrow': {
        attrs: { fill: 'currentColor' },
        inner: '<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20Z" />',
    },
};
