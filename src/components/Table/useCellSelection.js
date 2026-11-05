import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cellKey, cellSign } from '../../helpers/cellSelection';

export const LONG_PRESS_MS = 500;

// One selection at a time in the whole app: every table's bar sits in the same place.
let clearActiveSelection = null;

/**
 * Selection of money cells: a long press starts it, then a tap adds or removes a cell; Ctrl + click
 * and Shift + click on a computer. Cells are matched by row identity, not by position, so the
 * selection survives sorting, searching and paging, and its total follows the data when it changes.
 */
export default function useCellSelection({ dataset, filteredData, moneyColumns }) {
  const [selected, setSelected] = useState(() => new Set());
  const anchorRef = useRef(null);
  const pressTimerRef = useRef(null);
  const pressFiredRef = useRef(false);
  const pointerTypeRef = useRef('mouse');

  const clear = useCallback(() => {
    anchorRef.current = null;
    setSelected(new Set());
  }, []);

  const claimSelection = useCallback(() => {
    if (clearActiveSelection && clearActiveSelection !== clear) clearActiveSelection();
    clearActiveSelection = clear;
  }, [clear]);

  const cells = useMemo(() => {
    if (selected.size === 0) return [];
    const visible = new Set(filteredData);
    return dataset.flatMap((row) =>
      moneyColumns
        .filter((column) => selected.has(cellKey(row, column, moneyColumns)))
        .map((column) => ({ value: Number(row[column]) || 0, sign: cellSign(row, column), hidden: !visible.has(row) }))
    );
  }, [selected, dataset, filteredData, moneyColumns]);

  const active = cells.length > 0;

  // Every selected row is gone from the data: nothing left to show.
  useEffect(() => {
    if (selected.size > 0 && !active) clear();
  }, [selected, active, clear]);

  useEffect(() => {
    if (!active) return undefined;
    const onKeyDown = (e) => e.key === 'Escape' && clear();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [active, clear]);

  useEffect(
    () => () => {
      clearTimeout(pressTimerRef.current);
      if (clearActiveSelection === clear) clearActiveSelection = null;
    },
    [clear]
  );

  const toggle = useCallback(
    (row, column) => {
      claimSelection();
      const key = cellKey(row, column, moneyColumns);
      anchorRef.current = { row, column };
      setSelected((current) => {
        const next = new Set(current);
        if (!next.delete(key)) next.add(key);
        return next;
      });
    },
    [claimSelection, moneyColumns]
  );

  const selectRange = useCallback(
    (row, column) => {
      const anchor = anchorRef.current;
      if (!anchor || anchor.column !== column) return toggle(row, column);
      const from = filteredData.indexOf(anchor.row);
      const to = filteredData.indexOf(row);
      if (from === -1) return toggle(row, column);
      const range = filteredData.slice(Math.min(from, to), Math.max(from, to) + 1);
      setSelected((current) => new Set([...current, ...range.map((item) => cellKey(item, column, moneyColumns))]));
      return undefined;
    },
    [filteredData, moneyColumns, toggle]
  );

  const cancelPress = useCallback(() => clearTimeout(pressTimerRef.current), []);

  const cellProps = (row, column) => ({
    onPointerDown: (e) => {
      pointerTypeRef.current = e.pointerType;
      pressFiredRef.current = false;
      if (e.button !== 0) return;
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = setTimeout(() => {
        pressFiredRef.current = true;
        navigator.vibrate?.(15);
        toggle(row, column);
      }, LONG_PRESS_MS);
    },
    onPointerUp: cancelPress,
    onPointerLeave: cancelPress,
    onPointerCancel: cancelPress,
    onContextMenu: (e) => {
      // A long press on a phone also asks for the context menu; a right click keeps it.
      if (pointerTypeRef.current === 'touch') e.preventDefault();
    },
    onClick: (e) => {
      cancelPress();
      if (pressFiredRef.current) {
        pressFiredRef.current = false; // the release of the long press that just selected this cell
        return;
      }
      if (e.shiftKey) selectRange(row, column);
      else if (active || e.ctrlKey || e.metaKey) toggle(row, column);
    },
  });

  const isSelected = (row, column) => selected.has(cellKey(row, column, moneyColumns));

  return { active, cells, clear, cellProps, isSelected };
}
