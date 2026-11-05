import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { tableMoneyFormat } from '../../helpers/operations';
import { selectionStats } from '../../helpers/cellSelection';
import './SelectionBar.css';

const COPIED_MS = 1500;

/** The bar above the tabs: how many cells are selected and their sum or net, with details on tap. */
function SelectionBar({ cells, onClear, t }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef(null);
  const stats = selectionStats(cells);

  useEffect(() => () => clearTimeout(copiedTimerRef.current), []);

  const copyTotal = async () => {
    try {
      await navigator.clipboard.writeText(stats.total.toFixed(2));
      setCopied(true);
      clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopied(false), COPIED_MS);
    } catch {
      // No clipboard access: the total stays on screen.
    }
  };

  return (
    <div className="cell-selection-bar" role="status">
      <div className="cell-selection-main">
        <button
          type="button"
          className="cell-selection-summary"
          aria-expanded={detailsOpen}
          aria-label={t('moreStats')}
          onClick={() => setDetailsOpen(!detailsOpen)}
        >
          <span className="cell-selection-count">
            {stats.count} {t('selectedCells')}
            {stats.hidden > 0 && ` · ${stats.hidden} ${t('hiddenCells')}`}
          </span>
          <span className="cell-selection-total">
            {t(stats.net ? 'netCells' : 'sumCells')} {tableMoneyFormat(stats.total)}
          </span>
        </button>
        <button type="button" className="cell-selection-action" aria-label={t(copied ? 'copied' : 'copyTotal')} onClick={copyTotal}>
          {copied ? (
            '✓'
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15V6a2 2 0 0 1 2-2h9" />
            </svg>
          )}
        </button>
        <button type="button" className="cell-selection-action" aria-label={t('clearSelection')} onClick={onClear}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>
      </div>
      {detailsOpen && (
        <dl className="cell-selection-details">
          <div>
            <dt>{t('averageCells')}</dt>
            <dd>{tableMoneyFormat(stats.average)}</dd>
          </div>
          <div>
            <dt>{t('minCells')}</dt>
            <dd>{tableMoneyFormat(stats.min)}</dd>
          </div>
          <div>
            <dt>{t('maxCells')}</dt>
            <dd>{tableMoneyFormat(stats.max)}</dd>
          </div>
        </dl>
      )}
    </div>
  );
}

SelectionBar.propTypes = {
  cells: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClear: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default SelectionBar;
