import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
//import Data from './data.json';
import './Table.css';
function DataTable({ balance }) {
  DataTable.propTypes = {
    balance: PropTypes.any,
  };

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
    setData(balance);
  }, [balance]);

  const renderTableRows = () => {
    return data.map((item, index) => (
      <tr key={index}>
        <td>{item.month_num}</td>
        <td>{item.month_name}</td>
        <td>{item.year_num}</td>
        <td>{item.incomes}</td>
        <td>{item.bills}</td>
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
                <th>Month </th>
                <th>Year </th>
                <th>Incomes</th>
                <th>Bills</th>
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
