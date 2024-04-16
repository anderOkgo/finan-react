import PropTypes from 'prop-types';
import set from '../../helpers/set.json';
import { useEffect, useState } from 'react';

function TablePagination({ currentPage, goToPage, filteredData, itemsPerPage }) {
  const [totalPages, setTotalPages] = useState(1);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);

  useEffect(() => {
    // Calculate total pages whenever filtered data changes
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
    // Calculate startIndex and endIndex whenever currentPage or itemsPerPage changes
    const newStartIndex = (currentPage - 1) * itemsPerPage + 1;
    const newEndIndex = Math.min(currentPage * itemsPerPage, filteredData.length);
    setStartIndex(newStartIndex);
    setEndIndex(newEndIndex);
  }, [filteredData, itemsPerPage, currentPage]);

  const renderPaginationButtons = () => {
    const maxButtons = set.paginationMaxButtons;
    const buttons = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    return buttons;
  };

  const nextPage = () => {
    goToPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const prevPage = () => {
    goToPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  return (
    <>
      <small className="pagination-label">
        Showing {startIndex}-{endIndex} of {filteredData.length} records
      </small>
      <div className="pagination">
        <button onClick={prevPage} disabled={currentPage === 1} className="pagination-button">
          Prev
        </button>
        {renderPaginationButtons()}
        <button onClick={nextPage} disabled={currentPage === totalPages} className="pagination-button">
          Next
        </button>
      </div>
    </>
  );
}

TablePagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  goToPage: PropTypes.func.isRequired,
  filteredData: PropTypes.any.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
};

export default TablePagination;
