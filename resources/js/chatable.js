/**
 * The backend identifies a chat participant by a {type, id} pair (not a bare
 * numeric id, since more than one model can share the same id space) — see
 * Chat::identify() on the PHP side. This mirrors that as a single string key
 * so the frontend can use it in Sets/object-keyed maps/equality checks.
 */
export function chatableKey(type, id) {
    if (type == null || id == null) {
        return null;
    }

    return `${type}:${id}`;
}

/**
 * Build a chatableKey from a row that carries `{prefix}_type` / `{prefix}_id`
 * columns (participants, messages, reactions, receipts, starredBy, ...).
 */
export function chatableKeyOf(row, prefix = 'chatable') {
    if (!row) {
        return null;
    }

    return chatableKey(row[`${prefix}_type`], row[`${prefix}_id`]);
}
