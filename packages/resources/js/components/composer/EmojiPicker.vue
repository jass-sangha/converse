<script setup>
import { computed, ref } from 'vue';

const CATEGORIES = [
    {
        key: 'smileys',
        label: 'Smileys & People',
        icon: 'M9 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm6 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm-3 8a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-2a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm-4-5c.7 1.8 2.2 3 4 3s3.3-1.2 4-3Z',
        emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🫡', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '👍', '👎', '👏', '🙏', '👋', '🤝', '💪'],
    },
    {
        key: 'animals',
        label: 'Animals & Nature',
        icon: 'M4.5 9A2.5 2.5 0 1 1 4.5 4a2.5 2.5 0 0 1 0 5Zm15 0A2.5 2.5 0 1 1 19.5 4a2.5 2.5 0 0 1 0 5ZM8 6.5A2.5 2.5 0 1 1 8 1.5a2.5 2.5 0 0 1 0 5Zm8 0A2.5 2.5 0 1 1 16 1.5a2.5 2.5 0 0 1 0 5ZM12 21c-4 0-7-2.5-7-6.5C5 11 8 9 12 9s7 2 7 5.5c0 4-3 6.5-7 6.5Z',
        emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🙈', '🙉', '🙊', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐢', '🐍', '🦎', '🐙', '🦑', '🦀', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐆', '🦓', '🦍', '🐘', '🦒', '🐫', '🐄', '🐑', '🐐', '🐎', '🐕', '🐈', '🌵', '🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🎋', '🎍', '🌷', '🌹', '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '⭐', '🌟', '✨', '⚡', '🔥', '💧', '🌈'],
    },
    {
        key: 'food',
        label: 'Food & Drink',
        icon: 'M8 2a1 1 0 0 1 1 1v5a2 2 0 0 1-1 1.73V21a1 1 0 1 1-2 0V9.73A2 2 0 0 1 5 8V3a1 1 0 1 1 2 0v5h1V2Zm10 0a5 5 0 0 0-5 5v6h2v8a1 1 0 1 0 2 0v-8h2V7a5 5 0 0 0-1-3Z',
        emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🧄', '🧅', '🥔', '🍞', '🥐', '🥨', '🧀', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🍳', '🍜', '🍝', '🍣', '🍱', '🍦', '🍩', '🍪', '🎂', '🍰', '🧁', '🍫', '🍬', '🍭', '☕', '🍵', '🧃', '🥤', '🍺', '🍷', '🥂', '🍾'],
    },
    {
        key: 'activities',
        label: 'Activities',
        icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2a8 8 0 0 1 6.32 3.09L14 12l4.32 4.91A8 8 0 1 1 12 4Z',
        emojis: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥊', '🥋', '⛳', '🏹', '🎣', '🥅', '⛸️', '🎿', '🛷', '🏂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🏇', '🧘', '🏄', '🏊', '🚴', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️', '🎗️', '🎫', '🎟️', '🎪', '🤹', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🎮', '🎯', '🎳', '🎲', '🧩'],
    },
    {
        key: 'travel',
        label: 'Travel & Places',
        icon: 'M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z',
        emojis: ['🚗', '🚕', '🚙', '🚌', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🛵', '🏍️', '🚲', '🛴', '🚨', '🚂', '✈️', '🛫', '🛬', '🚀', '🛸', '🚁', '⛵', '🚤', '🛳️', '⚓', '🗺️', '🗽', '🗼', '🏰', '🏯', '🏟️', '🎡', '🎢', '🎠', '⛰️', '🏔️', '🌋', '🏕️', '🏖️', '🏝️', '🏜️', '🌆', '🌃', '🌉', '🌌', '🌠', '🏙️'],
    },
    {
        key: 'objects',
        label: 'Objects',
        icon: 'M9 21h6v-1H9Zm3-19a7 7 0 0 0-4 12.74V17h8v-2.26A7 7 0 0 0 12 2Z',
        emojis: ['⌚', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '💽', '💾', '💿', '📷', '📹', '🎥', '📞', '☎️', '📺', '📻', '🎙️', '⏱️', '⏰', '🔋', '🔌', '💡', '🔦', '🕯️', '📔', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '💰', '💳', '✉️', '📦', '📫', '📌', '📎', '✂️', '🔒', '🔑', '🔨', '🛠️', '🧰', '🔧', '⚙️', '🧲', '⚗️', '🧪'],
    },
    {
        key: 'symbols',
        label: 'Symbols',
        icon: 'M12 21.35 10.55 20C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A6.02 6.02 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54Z',
        emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '✅', '❌', '❗', '❓', '⁉️', '💯', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⭐', '🌟', '💫', '🔞', '📵', '🚫', '♻️', '⚜️', '🔰', '➡️', '⬅️', '⬆️', '⬇️', '↩️', '↪️'],
    },
    {
        key: 'flags',
        label: 'Flags',
        icon: 'M6 2v20H4V2Zm2 1h12l-3 4 3 4H8Z',
        emojis: ['🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🇮🇳', '🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇩🇪', '🇫🇷', '🇮🇹', '🇪🇸', '🇯🇵', '🇰🇷', '🇨🇳', '🇧🇷', '🇲🇽', '🇿🇦', '🇦🇪', '🇸🇬', '🇳🇿'],
    },
];

const KEYWORDS = {
    '😀': 'grin happy smile', '😂': 'laugh cry funny lol', '🤣': 'rofl laugh floor', '😊': 'smile blush happy',
    '😍': 'love heart eyes', '😘': 'kiss love', '😢': 'cry sad tear', '😭': 'cry sob sad',
    '😡': 'angry mad rage', '😱': 'scream shock omg', '😴': 'sleep tired', '🤔': 'think hmm',
    '👍': 'thumbsup like yes good', '👎': 'thumbsdown dislike no', '🙏': 'pray thanks please namaste',
    '👏': 'clap applause', '💪': 'muscle strong flex', '🔥': 'fire lit hot', '💯': 'hundred perfect',
    '❤️': 'love heart red', '💔': 'heartbreak sad', '🎉': 'party celebrate confetti', '🎂': 'cake birthday',
    '☕': 'coffee tea', '🍕': 'pizza food', '🍔': 'burger food', '🚗': 'car drive', '✈️': 'plane travel flight',
    '⚽': 'football soccer ball', '🏆': 'trophy win award', '🎮': 'game controller gaming',
    '💡': 'idea bulb light', '📱': 'phone mobile', '💻': 'laptop computer', '🔑': 'key lock',
};

const emit = defineEmits(['pick']);

const RECENT_KEY = 'converse:recent-emojis';
const recent = ref(readRecent());
const activeCategory = ref('recent');
const query = ref('');

function readRecent() {
    try {
        return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
    } catch {
        return [];
    }
}

function rememberRecent(emoji) {
    const next = [emoji, ...recent.value.filter((e) => e !== emoji)].slice(0, 24);
    recent.value = next;
    try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
        // localStorage unavailable — recents just won't persist this session.
    }
}

function pick(emoji) {
    rememberRecent(emoji);
    emit('pick', emoji);
}

const searchResults = computed(() => {
    const q = query.value.trim().toLowerCase();
    if (!q) return null;

    return CATEGORIES.flatMap((cat) => cat.emojis).filter((emoji, index, all) => all.indexOf(emoji) === index && (KEYWORDS[emoji] ?? '').includes(q));
});

const activeEmojis = computed(() => {
    if (activeCategory.value === 'recent') return recent.value;
    return CATEGORIES.find((cat) => cat.key === activeCategory.value)?.emojis ?? [];
});
</script>

<template>
    <div class="cv-emoji-picker w-80 rounded-cv border border-converse-border bg-converse-surface shadow-lg">
        <div class="cv-emoji-picker__tabs flex items-center gap-1 border-b border-converse-border p-1.5">
            <button
                type="button"
                title="Recent"
                class="flex h-8 w-8 items-center justify-center rounded"
                :class="activeCategory === 'recent' && !query ? 'bg-converse-accent/15 text-converse-accent' : 'text-converse-textMuted hover:bg-converse-surfaceHover'"
                @click="activeCategory = 'recent'; query = ''"
            >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22Zm1 11h5v2h-7V6h2Z"/></svg>
            </button>
            <button
                v-for="cat in CATEGORIES"
                :key="cat.key"
                type="button"
                :title="cat.label"
                class="flex h-8 w-8 items-center justify-center rounded"
                :class="activeCategory === cat.key && !query ? 'bg-converse-accent/15 text-converse-accent' : 'text-converse-textMuted hover:bg-converse-surfaceHover'"
                @click="activeCategory = cat.key; query = ''"
            >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path :d="cat.icon"/></svg>
            </button>
        </div>

        <div class="p-2">
            <div class="relative">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" class="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-converse-textMuted"><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z"/></svg>
                <input
                    v-model="query"
                    type="text"
                    placeholder="Search emoji"
                    class="w-full rounded bg-converse-surfaceHover py-1.5 pl-7 pr-2 text-sm text-converse-text focus:outline-none"
                >
            </div>
        </div>

        <div class="cv-emoji-picker__grid max-h-56 overflow-y-auto px-2 pb-2">
            <template v-if="searchResults">
                <div class="grid grid-cols-8 gap-1">
                    <button v-for="emoji in searchResults" :key="emoji" type="button" class="text-lg hover:scale-125" @click="pick(emoji)">{{ emoji }}</button>
                </div>
                <p v-if="!searchResults.length" class="py-4 text-center text-xs text-converse-textMuted">No matches.</p>
            </template>
            <template v-else>
                <p class="mb-1 text-xs font-medium uppercase text-converse-textMuted">
                    {{ activeCategory === 'recent' ? 'Recent' : CATEGORIES.find((c) => c.key === activeCategory)?.label }}
                </p>
                <div class="grid grid-cols-8 gap-1">
                    <button v-for="emoji in activeEmojis" :key="emoji" type="button" class="text-lg hover:scale-125" @click="pick(emoji)">{{ emoji }}</button>
                </div>
                <p v-if="activeCategory === 'recent' && !activeEmojis.length" class="py-4 text-center text-xs text-converse-textMuted">No recent emoji yet.</p>
            </template>
        </div>
    </div>
</template>
