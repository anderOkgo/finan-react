/**
 * Deleted movements, kept 7 days on this device (Finanz SPEC v0.9, §2.2.1). Stored next to the Offline
 * queue in localStorage and never sent to the server; logout clears every local key.
 */
export const DELETED_KEY = 'deleted';
export const KEEP_MS = 7 * 24 * 60 * 60 * 1000;

// The fields a restore sends again. The origin (operate_for) is left out on purpose: deleting never
// undid its adjustment (D4, G7), so sending it again would apply it twice.
const KEPT_FIELDS = ['movement_name', 'movement_val', 'movement_type', 'movement_date', 'movement_tag', 'currency'];

const readRaw = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(DELETED_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const write = (list) => {
  if (list.length === 0) localStorage.removeItem(DELETED_KEY);
  else localStorage.setItem(DELETED_KEY, JSON.stringify(list));
  return list;
};

const fresh = (list, now) => list.filter((row) => now - row.deletedAt < KEEP_MS);

/** The rows still within 7 days, newest first; older ones are dropped from storage too. */
export const readDeleted = (now = Date.now()) => {
  const raw = readRaw();
  const kept = fresh(raw, now);
  if (kept.length !== raw.length) write(kept);
  return kept.sort((a, b) => b.deletedAt - a.deletedAt);
};

/** Keeps a movement that was just deleted from the server. */
export const addDeleted = (movement, now = Date.now()) => {
  const kept = { key: `${now}-${Math.random().toString(36).slice(2, 8)}`, deletedAt: now };
  for (const field of KEPT_FIELDS) kept[field] = movement[field] ?? '';
  write([kept, ...fresh(readRaw(), now)]);
  return readDeleted(now);
};

/** Removes one row, after a restore or a delete for good. */
export const removeDeleted = (key, now = Date.now()) => {
  write(fresh(readRaw(), now).filter((row) => row.key !== key));
  return readDeleted(now);
};

/** The movement a restore sends as a new one: no id, no origin. */
export const toRestoreRequest = (row) => {
  const request = {};
  for (const field of KEPT_FIELDS) request[field] = row[field];
  return request;
};
