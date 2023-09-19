/* 


var data2 = [
    {
      name: 'John Doe',
      value: 1000,
      tag: 'Expense',
      source: 'Salary',
    },
    {
      name: 'Alice Smith',
      value: 750,
      tag: 'Expense',
      source: 'Rent',
    },
    {
      name: 'Bob Johnson',
      value: 500,
      tag: 'Income',
      source: 'Freelance',
    },
    {
      name: 'Eva Williams',
      value: 300,
      tag: 'Income',
      source: 'Part-time job',
    },
    {
      name: 'Charlie Brown',
      value: 1200,
      tag: 'Expense',
      source: 'Mortgage',
    },
  ];

  var columns2 = Object.keys(data2[0]);

import { useTable } from 'react-table';
import PropTypes from 'prop-types';

function DataTable({ columns, data }) {
  DataTable.propTypes = {
    columns: PropTypes.any,
    data: PropTypes.any,
  };
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data,
  });

  return (
    <table {...getTableProps()} className="table">
      <thead>
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th key={column.id} {...column.getHeaderProps()}>
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map((cell) => {
                return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default DataTable;
 */
