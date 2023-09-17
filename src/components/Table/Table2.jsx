import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
//import Data from './data.json';
import './Table.css';
function DataTable({ movimentSources }) {
  DataTable.propTypes = {
    movimentSources: PropTypes.any,
  };

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
    setData(movimentSources);
  }, [movimentSources]);

  const renderTableRows = () => {
    return data.map((item, index) => (
      <tr key={index}>
        <td>{item.month_number_mov}</td>
        <td>{item.name_source}</td>
        <td>{item.montly_sum}</td>
        <td>{item.year_mov}</td>
      </tr>
    ));
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
              <tr>
                <th>#</th>
                <th>Source </th>
                <th>Total </th>
                <th>Year</th>
              </tr>
            </thead>
            <tbody>{renderTableRows()}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DataTable;
