import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './Table.css';
import TablePagination from './TablePagination';
import set from '../../helpers/set.json';

function Table({
  data,
  columns,
  orderColums = false,
  hiddenColumns = [],
  onRowDoubleClick = false,
  label,
  onSearch,
  defaultItemsPerPage = set.PaginationDefaultItemsPerPage,
}) {
  const [dataset, setDataset] = useState([]);
  const [header, setHeader] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(defaultItemsPerPage);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);

  // reorder columns based on orderColums array
  useEffect(() => {
    if (data && data.length > 0) {
      const initialData = orderColums.length > 0 ? reorderTableHeader(data, orderColums) : data;
      setDataset(initialData);
      setFilteredData(initialData); // Initialize filtered data
      setHeader(Object.keys(data[0]));
    }
  }, [data, orderColums]);

  useEffect(() => {
    // Calculate total pages whenever filtered data changes
    setTotalPages(Math.ceil(filteredData.length / itemsPerPage));
    // Calculate startIndex and endIndex whenever currentPage or itemsPerPage changes
    const newStartIndex = (currentPage - 1) * itemsPerPage + 1;
    const newEndIndex = Math.min(currentPage * itemsPerPage, filteredData.length);
    setStartIndex(newStartIndex);
    setEndIndex(newEndIndex);
  }, [filteredData, itemsPerPage, currentPage]);

  // Search functionality
  const handleSearch = (newSearchTerm) => {
    setCurrentPage(1);
    setSearchTerm(newSearchTerm);
    // Filter data based on search term
    const filteredResults = dataset.filter((item) =>
      Object.values(item).some((value) => value.toString().toLowerCase().includes(newSearchTerm.toLowerCase()))
    );
    setFilteredData(filteredResults);

    onSearch && onSearch(filteredResults);
  };

  // Helper function to reorder data to print the new table
  const reorderTableHeader = (data, orderColumns) => {
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
    const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return currentData.map((item, index) => (
      <tr key={index} onDoubleClick={() => (onRowDoubleClick ? onRowDoubleClick(item) : false)}>
        {renderTableRow(item)}
      </tr>
    ));
  };

  return (
    <>
      <div className="table-container">
        <h2>{label}</h2>
        <hr />
        <div className="search-box">
          <label>
            Rows:{' '}
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
              className="search-box-input"
            >
              {set.TableSelectRowNumbers.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
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
        <div className="pagination-container">
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            goToPage={setCurrentPage}
            startIndex={startIndex}
            endIndex={endIndex}
            totalRecords={filteredData.length}
          />
        </div>
        <br />
      </div>
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
  defaultItemsPerPage: PropTypes.number,
};

export default Table;
