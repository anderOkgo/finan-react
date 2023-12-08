import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './Table.css';

function Table({ data, columns, hiddenColumns = [], onRowDoubleClick = false, label }) {
  const [dataset, setdataset] = useState([]);
  const [header, setHeader] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);

    if (data && data.length > 0) {
      setdataset(data);
      setHeader(Object.keys(data[0]));
    }
  }, [data]);

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
    return dataset.map((item, index) => (
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
          <table>
            <thead>
              {columns === undefined || columns.length === 0
                ? renderTableHeader(header)
                : renderTableHeader(columns)}
            </thead>
            <tbody>{renderTableRows()}</tbody>
          </table>
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
};

export default Table;
