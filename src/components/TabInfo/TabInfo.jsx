import PropTypes from 'prop-types';
import Table from '../Table/Table';
import { useState } from 'react';
//import Bank from '../InfoBanner/InfoBanner';

function TabInfo({ tripInfo, setForm, setEdit, setSelectedOption }) {
  const [selectedRow, setSelectedRow] = useState(null);

  const handleRowDoubleClick = (row) => {
    setSelectedRow(row);

    console.log(tripInfo);

    let type;
    switch (row.source.toLowerCase()) {
      case 'bill':
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
      {/* <Bank {...{ data: tripInfo['detail'], label: 'Total Save AU' }} /> */}
      <br />
      <Table
        label={'Trips Table'}
        columns={['detail', 'total']}
        hiddenColumns={[]}
        orderColums={['detail', 'total']}
        data={tripInfo}
        onRowDoubleClick={handleRowDoubleClick}
      />
      {selectedRow && true}
    </div>
  );
}

TabInfo.propTypes = {
  tripInfo: PropTypes.any,
  setForm: PropTypes.any,
  form: PropTypes.any,
  setEdit: PropTypes.any,
  setSelectedOption: PropTypes.any,
};

export default TabInfo;
