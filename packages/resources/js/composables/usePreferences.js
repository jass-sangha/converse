import { computed, ref, watch } from 'vue';

const PREFIX = 'converse:';

function read(key, fallback) {
    try {
        const raw = localStorage.getItem(PREFIX + key);
        return raw !== null ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function write(key, value) {
    try {
        localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
        // localStorage unavailable (quota/private mode) — preference just won't persist this session.
    }
}

const darkMediaQuery = typeof window !== 'undefined' ? window.matchMedia?.('(prefers-color-scheme: dark)') : null;
const systemPrefersDark = ref(darkMediaQuery?.matches ?? false);

const theme = ref(read('theme', 'system'));
const sidebarWidth = ref(read('sidebarWidth', 352));
const settingsPanelWidth = ref(read('settingsPanelWidth', 320));
const defaultWallpaper = ref(read('defaultWallpaper', null));

const effectiveTheme = computed(() => (theme.value === 'system' ? (systemPrefersDark.value ? 'dark' : 'light') : theme.value));

function applyTheme(value) {
    if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', value);
    }
}

applyTheme(effectiveTheme.value);

darkMediaQuery?.addEventListener?.('change', (event) => { systemPrefersDark.value = event.matches; });

watch(theme, (value) => write('theme', value));
watch(effectiveTheme, applyTheme);

watch(sidebarWidth, (value) => write('sidebarWidth', value));
watch(settingsPanelWidth, (value) => write('settingsPanelWidth', value));
watch(defaultWallpaper, (value) => write('defaultWallpaper', value));

export function usePreferences() {
    return {
        theme,
        effectiveTheme,
        setTheme: (value) => { theme.value = value; },
        toggleTheme: () => { theme.value = effectiveTheme.value === 'dark' ? 'light' : 'dark'; },
        sidebarWidth,
        setSidebarWidth: (px) => { sidebarWidth.value = px; },
        settingsPanelWidth,
        setSettingsPanelWidth: (px) => { settingsPanelWidth.value = px; },
        defaultWallpaper,
        setDefaultWallpaper: (value) => { defaultWallpaper.value = value; },
    };
}
