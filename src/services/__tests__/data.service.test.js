import { vi } from 'vitest';

vi.mock('../../helpers/helpHttp', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn() },
}));
vi.mock('../auth.service', () => ({
  default: {
    getCurrentUser: vi.fn(() => ({ token: 'tok' })),
    getUserName: vi.fn(() => ({ username: 'sample', role: 'user' })),
  },
}));
import helpHttp from '../../helpers/helpHttp';
import DataService from '../data.service';
import set from '../../helpers/set.json';

const movement = {
  id: 12,
  movement_name: '  Coffee ',
  movement_val: '1234.567',
  operate_for: '3',
  movement_type: '2',
  movement_date: '2026-11-14T10:00',
  movement_tag: ' food ',
  currency: 'COP',
};

const sent = {
  movement_name: 'Coffee',
  movement_val: 1234.57,
  operate_for: '3',
  movement_type: 2,
  movement_date: '2026-11-14T10:00',
  movement_tag: 'food',
  currency: 'COP',
  username: 'sample',
};

describe('DataService', () => {
  beforeEach(() => {
    Object.values(helpHttp).forEach((fn) => fn.mockResolvedValue({ ok: true }));
  });

  it('loads the initial data with the token', async () => {
    expect(await DataService.initialLoad({ date: 'd', currency: 'COP' })).toEqual({ ok: true });
    expect(helpHttp.post).toHaveBeenCalledWith(expect.stringMatching(/initial-load$/), {
      body: { date: 'd', currency: 'COP' },
      token: 'Bearer tok',
    });
  });

  it('boots with the boot timeout', async () => {
    await DataService.boot();
    expect(helpHttp.get).toHaveBeenCalledWith(expect.any(String), { timeout: set.boot_timeout });
  });

  it('inserts and updates a trimmed, rounded movement with the username', async () => {
    await DataService.insert(movement);
    expect(helpHttp.post).toHaveBeenCalledWith(expect.stringMatching(/insert$/), { body: sent, token: 'Bearer tok' });
    await DataService.update(movement);
    expect(helpHttp.put).toHaveBeenCalledWith(expect.stringMatching(/update\/12$/), { body: sent, token: 'Bearer tok' });
  });

  it('deletes by id with the username', async () => {
    await DataService.del(movement);
    expect(helpHttp.del).toHaveBeenCalledWith(expect.stringMatching(/delete\/12$/), {
      body: { username: 'sample' },
      token: 'Bearer tok',
    });
  });
});
