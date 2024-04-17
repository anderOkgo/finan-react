import PropTypes from 'prop-types';
import Table from '../Table/Table';
import { useState } from 'react';
import Bank from '../InfoBanner/InfoBanner';

function TabInfo({ tripInfo, balanceUntilDate, setForm, setEdit, setSelectedOption }) {
  const [selectedRow, setSelectedRow] = useState(null);

  const handleRowDoubleClick = (row) => {
    setSelectedRow(row);

    let type;
    switch (row.source.toLowerCase()) {
      case 'Expense':
        document.querySelector('#type').selectedIndex = 2;
        type = 2;
        break;
      case 'income':
        document.querySelector('#type').selectedIndex = 1;
        type = 1;
        break;
      case 'saving':
        document.querySelector('#type').selectedIndex = 7;
        type = 7;
        break;
      case 'balance':
        document.querySelector('#type').selectedIndex = 8;
        type = 8;
        break;
      case 'tax return':
        document.querySelector('#type').selectedIndex = 9;
        type = 9;
        break;
      case 'gyg payment':
        document.querySelector('#type').selectedIndex = 1;
        type = 1;
        break;
      case 'interest':
        document.querySelector('#type').selectedIndex = 1;
        type = 1;
        break;
      case 'visa refund':
        document.querySelector('#type').selectedIndex = 1;
        type = 1;
        break;
      case 'cash exchange':
        document.querySelector('#type').selectedIndex = 1;
        type = 1;
        break;
      default:
        document.querySelector('#type').selectedIndex = '';
        break;
    }

    const outputObject = {
      ...row,
      datemov: row.datemov,
      type: type,
    };

    setForm(outputObject);
    setEdit(true);
    setSelectedOption(1);
  };
  return (
    <div>
      <Bank {...{ data: tripInfo[5]['total'], label: 'Total Final Trip' }} />
      <br />
      <Table
        label={'Trips Table'}
        columns={['Type Trip', 'Total']}
        hiddenColumns={[]}
        orderColumnsList={['detail', 'total']}
        data={tripInfo.filter((item) => item.detail !== 'final-trip')}
        onRowDoubleClick={handleRowDoubleClick}
      />
      <br />
      <Table
        label={'Daily Balance'}
        columns={['Date', 'Balance', 'Total']}
        hiddenColumns={['currency']}
        orderColumnsList={[]}
        data={balanceUntilDate.filter((item) => item.detail !== 'final-trip')}
        onRowDoubleClick={handleRowDoubleClick}
      />
      {selectedRow && true}
    </div>
  );
}

TabInfo.propTypes = {
  tripInfo: PropTypes.any,
  balanceUntilDate: PropTypes.any,
  setForm: PropTypes.any,
  form: PropTypes.any,
  setEdit: PropTypes.any,
  setSelectedOption: PropTypes.any,
};

export default TabInfo;
