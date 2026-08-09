export const MUTE_DURATIONS = [
    { key: '8h', label: '8 hours', hours: 8 },
    { key: '1w', label: '1 week', hours: 24 * 7 },
    { key: 'always', label: 'Always', hours: null },
];

export function mutedUntilFor(durationKey) {
    const duration = MUTE_DURATIONS.find((d) => d.key === durationKey);
    if (!duration) return null;

    // "Always" has no real end date — a 10-year horizon reads as permanent in the UI
    // without needing a nullable "forever" sentinel on the muted_until column.
    const hours = duration.hours ?? 24 * 365 * 10;

    return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}
