import { ref, watch } from 'vue';

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

function systemPrefersDark() {
    return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

const theme = ref(read('theme', null) ?? (systemPrefersDark() ? 'dark' : 'light'));
const sidebarWidth = ref(read('sidebarWidth', 320));
const settingsPanelWidth = ref(read('settingsPanelWidth', 320));

function applyTheme(value) {
    if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', value);
    }
}

applyTheme(theme.value);

watch(theme, (value) => {
    write('theme', value);
    applyTheme(value);
});

watch(sidebarWidth, (value) => write('sidebarWidth', value));
watch(settingsPanelWidth, (value) => write('settingsPanelWidth', value));

export function usePreferences() {
    return {
        theme,
        setTheme: (value) => { theme.value = value; },
        toggleTheme: () => { theme.value = theme.value === 'dark' ? 'light' : 'dark'; },
        sidebarWidth,
        setSidebarWidth: (px) => { sidebarWidth.value = px; },
        settingsPanelWidth,
        setSettingsPanelWidth: (px) => { settingsPanelWidth.value = px; },
    };
}
