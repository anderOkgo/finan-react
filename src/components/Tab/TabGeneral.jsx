import PropTypes from 'prop-types';
import Table from '../Table/Table';
import { useState } from 'react';
import InfoBanner from '../InfoBanner/InfoBanner';

function TabGeneral({ movements, generalInfo, setForm, setEdit, setSelectedOption, currency }) {
  const [selectedRow, setSelectedRow] = useState(null);

  const handleRowDoubleClick = (row) => {
    setSelectedRow(row);
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
      default:
        document.querySelector('#type').selectedIndex = '';
        break;
    }

    const outputObject = {
      ...row,
      datemov: row.datemov,
      type: type,
      currency: currency,
    };

    setForm(outputObject);
    setEdit(true);
    setSelectedOption(1);
  };
  return (
    <div>
      <InfoBanner {...{ data: generalInfo?.['total'] ?? -1, label: 'Total Save AU' }} />
      <br />
      <Table
        label={'Movement Table'}
        columns={['Date', 'Name', 'Value', 'Tag', 'Source', 'Id']}
        hiddenColumns={['Id', 'id']}
        orderColumnsList={['datemov', 'name', 'val', 'tag', 'source', 'id']}
        data={movements}
        onRowDoubleClick={handleRowDoubleClick}
      />
      {selectedRow && true}
    </div>
  );
}

TabGeneral.propTypes = {
  movements: PropTypes.any,
  generalInfo: PropTypes.any,
  setForm: PropTypes.any,
  setEdit: PropTypes.any,
  setSelectedOption: PropTypes.any,
  currency: PropTypes.any,
};

export default TabGeneral;
