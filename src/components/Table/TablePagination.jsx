import PropTypes from 'prop-types';

function TablePagination({ currentPage, totalPages, goToPage, startIndex, endIndex, totalRecords }) {
  const renderPaginationButtons = () => {
    const maxButtons = 5;
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
        Showing {startIndex}-{endIndex} of {totalRecords} records
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
  totalPages: PropTypes.number.isRequired,
  goToPage: PropTypes.func.isRequired,
  startIndex: PropTypes.number.isRequired,
  endIndex: PropTypes.number.isRequired,
  totalRecords: PropTypes.number.isRequired,
};

export default TablePagination;
