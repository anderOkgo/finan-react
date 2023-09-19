import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './Table.css';

function DataTable({ data, headernames }) {
  DataTable.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
    headernames: PropTypes.arrayOf(PropTypes.object),
  };

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
    return (
      <tr>
        {header.map((item, index) => (
          <th key={index}>{item}</th>
        ))}
      </tr>
    );
  };

  const renderTableRow = (row) => {
    return row.map((item, index) => <td key={index}>{item}</td>);
  };

  const renderTableRows = () => {
    return dataset.map((item, index) => <tr key={index}>{renderTableRow(Object.values(item))}</tr>);
  };

  return (
    <div>
      <h2>Data Table</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              {headernames === undefined || headernames.length == 0
                ? renderTableHeader(header)
                : renderTableHeader(headernames)}
            </thead>
            <tbody>{renderTableRows()}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DataTable;
