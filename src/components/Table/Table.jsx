import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './Table.css';
import TablePagination from './TablePagination';
import set from '../../helpers/set.json';

function Table({ data, columns, orderColums = false, hiddenColumns = [], onRowDoubleClick = false, label }) {
  const [dataset, setDataset] = useState([]);
  const [header, setHeader] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(set.PaginationDefaultItemsPerPage);

  // Helper function to reorder data to print the table based on orderColums array
  const reorderTableHeader = (data, orderColumns) => {
    return data.map((item) => {
      const reorderedItem = {};
      orderColumns.forEach((prop) => (reorderedItem[prop] = item[prop]));
      return reorderedItem;
    });
  };

  // reorder columns based on orderColums array
  useEffect(() => {
    if (data && data.length > 0) {
      const initialData = orderColums.length > 0 ? reorderTableHeader(data, orderColums) : data;
      setDataset(initialData);
      setFilteredData(initialData);
      setHeader(Object.keys(data[0]));
    }
  }, [data, orderColums]);

  // Rendering Table header functions
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

  // Search functionality
  const handleSearch = (newSearchTerm) => {
    setCurrentPage(1);
    setSearchTerm(newSearchTerm);
    // Filter data based on search term
    const filteredResults = dataset.filter((item) =>
      Object.values(item).some((value) => value.toString().toLowerCase().includes(newSearchTerm.toLowerCase()))
    );
    setFilteredData(filteredResults);
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
            setCurrentPage={setCurrentPage}
            filteredData={filteredData}
            itemsPerPage={itemsPerPage}
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
  defaultItemsPerPage: PropTypes.number,
};

export default Table;
