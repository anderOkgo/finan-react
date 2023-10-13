import PropTypes from 'prop-types';
import Table from '../Table/Table';
import { useState } from 'react';

function TabGeneral({ moviments, setForm, setEdit, setSelectedOption }) {
  const [selectedRow, setSelectedRow] = useState(null);

  const handleRowDoubleClick = (row) => {
    setSelectedRow(row);

    let type;
    switch (row.source.toLowerCase()) {
      case 'bill':
        document.querySelector('#type').selectedIndex = 2;
        type = 2;
        break; // Select "Bill"
      case 'income':
        document.querySelector('#type').selectedIndex = 1;
        type = 1;
        break; // Select "Income"
      case 'saving':
        document.querySelector('#type').selectedIndex = 7;
        type = 7;
        break; // Select "Saving"
      case 'balance':
        document.querySelector('#type').selectedIndex = 8;
        type = 8;
        break; // Select "Balance"
      case 'tax return':
        document.querySelector('#type').selectedIndex = 9;
        type = 9;
        break; // Select "Tax return"
      case 'gyg payment':
        document.querySelector('#type').selectedIndex = 1;
        type = 1;
        break; // Select "GYG payment"
      case 'interest':
        document.querySelector('#type').selectedIndex = 1;
        type = 1;
        break; // Select "Interest"
      case 'visa refund':
        document.querySelector('#type').selectedIndex = 1;
        type = 1;
        break; // Select "Visa refund"
      case 'cash exchange':
        document.querySelector('#type').selectedIndex = 1;
        type = 1;
        break; // Select "Cash exchange"
      default:
        document.querySelector('#type').selectedIndex = '';
        break; // Select the default option (e.g., "---")
    }

    const dateFromDatabase = row.datemov;
    const dateInJavaScript = new Date(dateFromDatabase.replace(' ', 'T')); // Convert the date

    let formattedDate = dateInJavaScript.toLocaleString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const parts = formattedDate.split(', ');
    const dateParts = parts[0].split('/');
    const timePart = parts[1];

    const year = dateParts[2];
    const month = dateParts[1];
    const day = dateParts[0];

    formattedDate = `${year}-${month}-${day} ${timePart}`;

    const outputObject = {
      ...row,
      datemov: formattedDate,
      type: type,
    };

    setForm(outputObject);
    console.log(outputObject);
    setEdit(true);
    setSelectedOption(1);
  };
  return (
    <div>
      <h2>Table Moviments</h2>
      <hr />
      <Table data={moviments} onRowDoubleClick={handleRowDoubleClick} />
      {selectedRow && (
        <div>
          <h2>Selected Row Data:</h2>
          <pre>{JSON.stringify(selectedRow, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

TabGeneral.propTypes = {
  moviments: PropTypes.any,
  setForm: PropTypes.any,
  form: PropTypes.any,
  setEdit: PropTypes.any,
  setSelectedOption: PropTypes.any,
};

export default TabGeneral;
