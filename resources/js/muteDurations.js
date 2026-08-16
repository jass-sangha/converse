export const MUTE_DURATIONS = [
    { key: '8h', label: '8 hours', hours: 8 },
    { key: '24h', label: '24 hours', hours: 24 },
    { key: '7d', label: '7 days', hours: 24 * 7 },
    { key: '90d', label: '90 days', hours: 24 * 90 },
    { key: 'always', label: 'Until I turn it back on', hours: null },
];

export function mutedUntilFor(durationKey) {
    const duration = MUTE_DURATIONS.find((d) => d.key === durationKey);
    if (!duration) return null;

    // "Always" has no real end date — a 10-year horizon reads as permanent in the UI
    // without needing a nullable "forever" sentinel on the muted_until column.
    const hours = duration.hours ?? 24 * 365 * 10;

    return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}
