// Pure rules of the table's cell selection (docs/changes/20261105-finan-table-cell-sum.md).

/** A row's identity across reloads: its id, or else its non-money values for the summary tables. */
export const rowIdentity = (row, moneyColumns) => {
  const id = row.id ?? row.Id ?? row.ID;
  if (id !== undefined && id !== null) return `id:${id}`;
  return Object.keys(row)
    .filter((key) => !moneyColumns.includes(key))
    .map((key) => row[key])
    .join('|');
};

export const cellKey = (row, column, moneyColumns) => `${rowIdentity(row, moneyColumns)}#${column}`;

const rowType = (row) => String(row.source ?? row.name_source ?? row.type ?? '').toLowerCase();

/** Gastos are stored as positive numbers, so a gasto subtracts by its row type or its column. */
export const cellSign = (row, column) => (rowType(row) === 'expense' || column === 'expenses' ? -1 : 1);

/**
 * Totals of the selected cells, each `{ value, sign, hidden }`, added in cents to avoid decimal
 * errors. Only gastos read as a plain sum; gastos with anything else read as a net.
 */
export const selectionStats = (cells) => {
  const onlyExpenses = cells.length > 0 && cells.every((cell) => cell.sign < 0);
  const net = !onlyExpenses && cells.some((cell) => cell.sign < 0);
  const cents = cells.map((cell) => Math.round(cell.value * 100) * (onlyExpenses ? 1 : cell.sign));
  const total = cents.reduce((sum, value) => sum + value, 0);
  return {
    count: cells.length,
    hidden: cells.filter((cell) => cell.hidden).length,
    net,
    total: total / 100,
    average: cells.length ? total / cells.length / 100 : 0,
    min: cells.length ? Math.min(...cents) / 100 : 0,
    max: cells.length ? Math.max(...cents) / 100 : 0,
  };
};
