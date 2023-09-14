import { useEffect, useState } from 'react';
import DataService from '../../services/data.service';
import Data from './data.json';
import './Table.css';
function DataTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [init, setInit] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (init) {
        let resp = await DataService.totalBank();
        resp.err ? setInit(false) : setData(resp[0] === undefined ? 0 : resp[0].total_bank) & setInit(true);
      }
      setData(Data);
      setLoading(false);
    };

    fetchData();
  }, [init]);

  const renderTableRows = () => {
    return data.map((item, index) => (
      <tr key={index}>
        <td>{item.month_name}</td>
        <td>{item.month_num}</td>
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
                <th>Month Name</th>
                <th>Month Number</th>
                <th>Year Number</th>
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
