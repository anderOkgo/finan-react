import { vi } from 'vitest';
import {
  DELETED_KEY,
  KEEP_MS,
  addDeleted,
  readDeleted,
  removeDeleted,
  toRestoreRequest,
} from '../deletedMovements';

const movement = {
  id: 42,
  movement_name: 'Lunch',
  movement_val: '25000',
  operate_for: '7',
  movement_type: '2',
  movement_date: '2026-11-14T12:30',
  movement_tag: 'food',
  currency: 'COP',
};

const stored = () => JSON.parse(localStorage.getItem(DELETED_KEY));

describe('deletedMovements (Finanz SPEC v0.9, §2.2.1)', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('keeps 7 days', () => {
    expect(KEEP_MS).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('keeps the fields a restore needs, without the id or the origin (G7)', () => {
    const [row] = addDeleted(movement, 1000);
    expect(row).toEqual({
      key: expect.stringMatching(/^1000-/),
      deletedAt: 1000,
      movement_name: 'Lunch',
      movement_val: '25000',
      movement_type: '2',
      movement_date: '2026-11-14T12:30',
      movement_tag: 'food',
      currency: 'COP',
    });
    expect(stored()).toHaveLength(1);
  });

  it('fills a missing field with a blank', () => {
    const [row] = addDeleted({ movement_name: 'Only a name' }, 1000);
    expect(row.movement_tag).toBe('');
    expect(row.currency).toBe('');
  });

  it('lists the newest first', () => {
    addDeleted({ ...movement, movement_name: 'Older' }, 1000);
    addDeleted({ ...movement, movement_name: 'Newer' }, 2000);
    expect(readDeleted(3000).map((row) => row.movement_name)).toEqual(['Newer', 'Older']);
  });

  it('drops a row once it is 7 days old, from the list and from storage (H6)', () => {
    addDeleted(movement, 1000);
    expect(readDeleted(1000 + KEEP_MS - 1)).toHaveLength(1);
    expect(readDeleted(1000 + KEEP_MS)).toEqual([]);
    expect(localStorage.getItem(DELETED_KEY)).toBeNull();
  });

  it('drops old rows when a new one is added', () => {
    addDeleted({ ...movement, movement_name: 'Old' }, 1000);
    const list = addDeleted({ ...movement, movement_name: 'New' }, 1000 + KEEP_MS);
    expect(list.map((row) => row.movement_name)).toEqual(['New']);
    expect(stored()).toHaveLength(1);
  });

  it('removes one row, and the key itself when none is left', () => {
    const [a] = addDeleted({ ...movement, movement_name: 'A' }, 1000);
    const [b] = addDeleted({ ...movement, movement_name: 'B' }, 2000);
    expect(removeDeleted(a.key, 3000).map((row) => row.key)).toEqual([b.key]);
    expect(removeDeleted(b.key, 3000)).toEqual([]);
    expect(localStorage.getItem(DELETED_KEY)).toBeNull();
  });

  it('reads nothing from a missing, broken or wrong-shaped value', () => {
    expect(readDeleted()).toEqual([]);
    localStorage.setItem(DELETED_KEY, '{not json');
    expect(readDeleted()).toEqual([]);
    localStorage.setItem(DELETED_KEY, '{"a":1}');
    expect(readDeleted()).toEqual([]);
  });

  it('uses the real clock by default', () => {
    vi.spyOn(Date, 'now').mockReturnValue(5000);
    const [row] = addDeleted(movement);
    expect(row.deletedAt).toBe(5000);
    expect(readDeleted()).toHaveLength(1);
    expect(removeDeleted(row.key)).toEqual([]);
  });

  it('builds the restore request: the kept fields, no id, no origin (H3)', () => {
    const [row] = addDeleted(movement, 1000);
    const request = toRestoreRequest(row);
    expect(request).toEqual({
      movement_name: 'Lunch',
      movement_val: '25000',
      movement_type: '2',
      movement_date: '2026-11-14T12:30',
      movement_tag: 'food',
      currency: 'COP',
    });
    expect('operate_for' in request).toBe(false);
    expect('id' in request).toBe(false);
  });
});
