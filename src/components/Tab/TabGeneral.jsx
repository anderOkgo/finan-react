import PropTypes from 'prop-types';
import Table from '../Table/Table';
import { useState } from 'react';
import InfoBanner from '../InfoBanner/InfoBanner';

function TabGeneral({ movements, totalDay, setForm, setEdit, setSelectedOption, currency }) {
  const [selectedRow, setSelectedRow] = useState(null);

  const handleRowDoubleClick = (row) => {
    setSelectedRow(row);
    let type;
    switch (row.source.toLowerCase()) {
      case 'bill':
        document.querySelector('#movement_type').selectedIndex = 2;
        type = 2;
        break;
      case 'income':
        document.querySelector('#movement_type').selectedIndex = 1;
        type = 1;
        break;
      default:
        document.querySelector('#movement_type').selectedIndex = '';
        break;
    }
    const outputObject = {
      id: row.id,
      source: row.source,
      movement_name: row.name,
      movement_val: row.val,
      movement_tag: row.tag,
      movement_date: row.datemov,
      movement_type: type,
      currency: currency,
    };

    setForm(outputObject);
    setEdit(true);
    setSelectedOption(1);
  };
  return (
    <div>
      <InfoBanner {...{ data: totalDay, label: 'Total Day' }} />
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
  movements: PropTypes.arrayOf(PropTypes.object).isRequired,
  setForm: PropTypes.func,
  setEdit: PropTypes.func,
  setSelectedOption: PropTypes.func,
  currency: PropTypes.string,
  totalDay: PropTypes.number,
};

export default TabGeneral;
