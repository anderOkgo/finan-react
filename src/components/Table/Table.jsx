import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './Table.css';

function Table({
  data,
  columns,
  orderColums = [],
  hiddenColumns = [],
  onRowDoubleClick = false,
  label,
  onSearch,
  itemsPerPages = 20, // Default items per page
}) {
  const [dataset, setDataset] = useState([]);
  const [header, setHeader] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Current page of pagination
  const [totalPages, setTotalPages] = useState(1); // Total number of pages
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPages);

  useEffect(() => {
    setLoading(false);

    if (data && data.length > 0) {
      const initialData = orderColums.length > 0 ? reorderArray(data, orderColums) : data;
      setDataset(initialData);
      setFilteredData(initialData); // Initialize filtered data
      setHeader(Object.keys(data[0]));
    }
  }, [data]);

  useEffect(() => {
    // Calculate total pages whenever filtered data changes
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
  }, [filteredData, itemsPerPage]);

  // Search functionality
  const handleSearch = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);

    // Filter data based on search term
    const filteredResults = dataset.filter((item) =>
      Object.values(item).some((value) => value.toString().toLowerCase().includes(newSearchTerm.toLowerCase()))
    );
    setFilteredData(filteredResults);

    onSearch && onSearch(filteredResults);
  };

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const nextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const prevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleItemsPerPageChange = (event) => {
    const newItemsPerPage = parseInt(event.target.value);
    setCurrentPage(1); // Reset current page when items per page changes
    setItemsPerPage(newItemsPerPage);
  };

  const renderPagination = () => {
    const pages = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage < maxButtons - 1) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`pagination-button ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button onClick={prevPage} disabled={currentPage === 1} className="pagination-button">
          Prev
        </button>
        {pages}
        <button onClick={nextPage} disabled={currentPage === totalPages} className="pagination-button">
          Next
        </button>
      </div>
    );
  };

  // Helper function to reorder array
  const reorderArray = (data, orderColumns) => {
    return data.map((item) => {
      const reorderedItem = {};
      orderColumns.forEach((prop) => (reorderedItem[prop] = item[prop]));
      return reorderedItem;
    });
  };

  // Rendering functions
  const renderTableHeader = (header) => {
    const filteredHeader = header.filter((item) => !hiddenColumns.includes(item));

    return (
      <tr>
        {filteredHeader.map((item, index) => (
          <th key={index}>{item}</th>
        ))}
      </tr>
    );
  };

  const renderTableRow = (row) => {
    return Object.keys(row).map((key, index) => (
      <td key={index} className={hiddenColumns.includes(key) ? 'hidden-column' : ''}>
        {row[key]}
      </td>
    ));
  };

  const renderTableRows = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentData = filteredData.slice(startIndex, endIndex);

    return currentData.map((item, index) => (
      <tr key={index} onDoubleClick={() => (onRowDoubleClick ? onRowDoubleClick(item) : false)}>
        {renderTableRow(item)}
      </tr>
    ));
  };

  return (
    <>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-container">
          <h2>{label}</h2>
          <hr />

          <div className="search-box">
            <label>
              Rows per page:{' '}
              <select value={itemsPerPage} onChange={handleItemsPerPageChange} className="search-box-input">
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={1000}>1000</option>
                <option value={10000}>10000</option>
              </select>
            </label>
            <input
              className="search-box-input"
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search..."
            />
          </div>

          <table>
            <thead>
              {columns === undefined || columns.length === 0
                ? renderTableHeader(header)
                : renderTableHeader(columns)}
            </thead>
            <tbody>{renderTableRows()}</tbody>
          </table>
          <div className="pagination-container">{renderPagination()}</div>
          <br />
        </div>
      )}
    </>
  );
}

Table.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  onRowDoubleClick: PropTypes.any,
  columns: PropTypes.any,
  hiddenColumns: PropTypes.arrayOf(PropTypes.string),
  label: PropTypes.any,
  orderColums: PropTypes.any,
  onSearch: PropTypes.func,
  itemsPerPage: PropTypes.number, // Added prop type for items per page
  itemsPerPages: PropTypes.number, // Added prop type for items per page
};

export default Table;
