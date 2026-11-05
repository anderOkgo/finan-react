import { cellKey, cellSign, rowIdentity, selectionStats } from '../cellSelection';

describe('rowIdentity', () => {
  it('uses the id when the row has one, or else its non-money values', () => {
    expect(rowIdentity({ id: 7, val: 1 }, ['val'])).toBe('id:7');
    expect(rowIdentity({ Id: 8 }, [])).toBe('id:8');
    expect(rowIdentity({ ID: 9 }, [])).toBe('id:9');
    expect(rowIdentity({ id: null, tag: 'food', source: 'expense', total: 5 }, ['total'])).toBe('|food|expense');
    expect(cellKey({ id: 7 }, 'val', [])).toBe('id:7#val');
  });
});

describe('cellSign', () => {
  it('a gasto subtracts by its type, however the table names it, or by the Gastos column', () => {
    expect(cellSign({ source: 'expense' }, 'val')).toBe(-1);
    expect(cellSign({ source: 'Expense' }, 'val')).toBe(-1);
    expect(cellSign({ name_source: 'expense' }, 'montly_sum')).toBe(-1);
    expect(cellSign({ type: 'expense' }, 'total')).toBe(-1);
    expect(cellSign({}, 'expenses')).toBe(-1);
    expect(cellSign({ source: 'income' }, 'val')).toBe(1);
    expect(cellSign({ source: 'balance' }, 'val')).toBe(1);
    expect(cellSign({}, 'incomes')).toBe(1);
  });
});

describe('selectionStats', () => {
  it('is empty without cells', () => {
    expect(selectionStats([])).toEqual({ count: 0, hidden: 0, net: false, total: 0, average: 0, min: 0, max: 0 });
  });

  it('adds in cents, so decimals stay exact', () => {
    expect(selectionStats([{ value: 0.1, sign: 1 }, { value: 0.2, sign: 1 }]).total).toBe(0.3);
  });

  it('gastos with an ingreso read as a net; only gastos as a positive sum', () => {
    const mixed = selectionStats([{ value: 100, sign: 1 }, { value: 30, sign: -1, hidden: true }]);
    expect(mixed).toMatchObject({ count: 2, hidden: 1, net: true, total: 70, average: 35, min: -30, max: 100 });
    expect(selectionStats([{ value: 30, sign: -1 }, { value: 20, sign: -1 }])).toMatchObject({ net: false, total: 50, min: 20, max: 30 });
  });
});
