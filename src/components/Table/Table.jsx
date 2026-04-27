import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './Table.css';
import './TablePagination.css';
import TablePagination from './TablePagination';
import set from '../../helpers/set.json';
import TableSearch from './TableSearch';
import { useContext } from 'react';
import GlobalContext from '../../contexts/GlobalContext';

function Table({
  data = [],
  columns = [],
  orderColumnsList = false,
  hiddenColumns = [],
  onRowDoubleClick = false,
  label = 'No label',
  onFilteredDataChange = false,
  onRowDelete = null,
  onRowEdit = null,
}) {
  const [dataset, setDataset] = useState([]);
  const [header, setHeader] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(set.pagination_default_items_per_page);
  const [sortOrder, setSortOrder] = useState({ columnIndex: null, descending: false });
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const { t } = useContext(GlobalContext);

  // Helper function useEffect to reorder data to print the table based on orderColumnsList array
  const reorderTableHeader = (data, orderColumnsList) => {
    return data.map((item) => {
      const reorderedItem = {};
      orderColumnsList.forEach((prop) => (reorderedItem[prop] = item[prop]));
      return reorderedItem;
    });
  };

  // reorder columns based on orderColumnsList array
  useEffect(() => {
    if (data && data.length > 0) {
      const initialData = (orderColumnsList?.length ?? 0 > 0) ? reorderTableHeader(data, orderColumnsList) : data;
      setDataset(initialData);
      setFilteredData(initialData);
      setHeader(Object.keys(initialData[0]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  // Notify parent component of filtered data changes
  useEffect(() => {
    if (onFilteredDataChange) {
      onFilteredDataChange(filteredData);
    }
  }, [filteredData, onFilteredDataChange]);

  // Function to handle header click for sorting
  const handleHeaderClick = (columnIndex) => {
    const descending = sortOrder.columnIndex === columnIndex ? !sortOrder.descending : false;
    setSortOrder({ columnIndex, descending });
    const visibleKeys = header.filter((key) => !hiddenColumns.includes(key));
    const sortKey = visibleKeys[columnIndex];
    const reorderedData = filteredData.slice().sort((a, b) => {
      const valueA = a[sortKey];
      const valueB = b[sortKey];
      if (descending) {
        return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
      } else {
        return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
      }
    });
    setFilteredData(reorderedData);
  };

  // Render the table header with sorting capability
  const renderTableHeader = (header) => {
    const filteredHeader = header.filter((item) => !hiddenColumns.includes(item));
    return (
      <tr>
        {filteredHeader.map((item, index) => (
          <th key={index} onClick={() => handleHeaderClick(index)}>
            {item}
            {sortOrder.columnIndex === index && sortOrder.descending
              ? ' ▼'
              : sortOrder.columnIndex === index
                ? ' ▲'
                : ''}
          </th>
        ))}
        {(onRowEdit || onRowDelete) && <th>{t('actions') || 'Actions'}</th>}
      </tr>
    );
  };

  const renderTableColumns = (row) => {
    return Object.keys(row).map((key, index) => (
      <td key={index} className={hiddenColumns.includes(key) ? 'hidden-column' : ''}>
        {t(row[key])}
      </td>
    ));
  };

  const renderTableRows = () => {
    return currentData.map((item, index) => (
      <tr key={index} onDoubleClick={() => (onRowDoubleClick ? onRowDoubleClick(item) : false)}>
        {renderTableColumns(item)}
        {(onRowEdit || onRowDelete) && (
          <td>
            <div style={{ display: 'flex', gap: '8px' }}>
              {onRowEdit && (
                <button
                  className="btn-primarys"
                  style={{
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRowEdit(item);
                  }}
                  title={t('edit') || 'Edit'}
                >
                  &#9998; {/* Representa un lápiz: ✎ */}
                </button>
              )}

              {onRowDelete && (
                <button
                  className="btn-primarys"
                  style={{
                    padding: '4px 8px',
                    backgroundColor: 'var(--color-danger)',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRowDelete(item);
                  }}
                  title={t('delete') || 'Delete'}
                >
                  &#128465; {/* Representa una papelera: 🗑 */}
                </button>
              )}
            </div>
          </td>
        )}
      </tr>
    ));
  };

  return (
    <>
      <div className="table-container">
        <h2>{label}</h2>
        <hr />
        <TableSearch {...{ setCurrentPage, setFilteredData, setItemsPerPage, dataset, itemsPerPage }} />
        <table>
          <thead>{columns.length === 0 ? renderTableHeader(header) : renderTableHeader(columns)}</thead>
          <tbody>{renderTableRows()}</tbody>
        </table>
        <div className="pagination-container">
          <TablePagination {...{ currentPage, setCurrentPage, filteredData, itemsPerPage, elemet: label }} />
        </div>
        <br />
      </div>
    </>
  );
}

Table.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  onRowDoubleClick: PropTypes.any,
  columns: PropTypes.array,
  hiddenColumns: PropTypes.arrayOf(PropTypes.string),
  label: PropTypes.string,
  orderColumnsList: PropTypes.array,
  defaultItemsPerPage: PropTypes.number,
  onFilteredDataChange: PropTypes.func,
  onRowDelete: PropTypes.func,
  onRowEdit: PropTypes.func,
};

export default Table;
