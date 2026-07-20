import { vi } from 'vitest';
import { moneyFormat, tableMoneyFormat, monthDiff, formattedDate, generateUniqueId } from '../operations';

describe('moneyFormat', () => {
  it('formats a number as USD currency with 2 decimals', () => {
    expect(moneyFormat(1000)).toBe('$1,000.00');
    expect(moneyFormat(0)).toBe('$0.00');
    expect(moneyFormat(-50.5)).toBe('-$50.50');
  });
});

describe('tableMoneyFormat', () => {
  it('formats a number with 2 decimals and no currency symbol', () => {
    expect(tableMoneyFormat(1000)).toBe('1,000.00');
    expect(tableMoneyFormat(0)).toBe('0.00');
  });
});

describe('monthDiff', () => {
  // Using local-time `new Date(year, monthIndex, day)` constructors rather
  // than ISO date-only strings ('2024-01-15') on purpose: ISO date-only
  // strings parse as UTC midnight, which `monthDiff`'s getMonth()/getDate()
  // calls then read back in the *local* timezone -- in a UTC-negative zone
  // that silently shifts the date backward a day, corrupting the result.
  // (Confirmed: this is a real, environment-dependent bug in monthDiff
  // itself, not a test artifact -- flagged in the roadmap, not fixed here,
  // since fixing it changes the return value for every existing ISO-string
  // caller and needs its own verification pass.) Local-time Date objects
  // sidestep the bug entirely, keeping this test deterministic everywhere.
  it('is 0 for the same date', () => {
    const d = new Date(2024, 0, 15);
    expect(monthDiff(d, d)).toBe(0);
  });

  it('is exactly 1 when the second date is one calendar month later, same day', () => {
    expect(monthDiff(new Date(2024, 0, 15), new Date(2024, 1, 15))).toBe(1);
  });

  it('adds a fractional part for a partial month (no day-underflow)', () => {
    // Jan 1 -> Jan 16 is 15 of January's 31 days.
    expect(monthDiff(new Date(2024, 0, 1), new Date(2024, 0, 16))).toBeCloseTo(15 / 31, 5);
  });

  it('decrements the whole-month count when the end day-of-month is earlier than the start (day-underflow branch)', () => {
    // Jan 20 -> Feb 10: less than a full calendar month even though it
    // crosses a month boundary, so the whole-month count must drop to 0
    // and the remainder must be expressed as a fraction of January (31 days).
    expect(monthDiff(new Date(2024, 0, 20), new Date(2024, 1, 10))).toBeCloseTo(21 / 31, 5);
  });

  it('counts whole years as 12-month multiples', () => {
    expect(monthDiff(new Date(2023, 2, 1), new Date(2024, 2, 1))).toBe(12);
  });
});

describe('formattedDate', () => {
  it('formats the current date as YYYY-MM-DD with zero-padded month/day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 0, 5)); // Jan 5, 2024 -- both month and day need padding
    expect(formattedDate()).toBe('2024-01-05');
    vi.useRealTimers();
  });
});

describe('generateUniqueId', () => {
  it('starts with an underscore and is non-empty', () => {
    const id = generateUniqueId();
    expect(id.startsWith('_')).toBe(true);
    expect(id.length).toBeGreaterThan(1);
  });

  it('generates different ids across calls', () => {
    expect(generateUniqueId()).not.toBe(generateUniqueId());
  });
});
