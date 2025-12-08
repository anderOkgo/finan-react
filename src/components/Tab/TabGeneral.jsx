import PropTypes from 'prop-types';
import Table from '../Table/Table';
import { useState } from 'react';
import InfoBanner from '../InfoBanner/InfoBanner';

function TabGeneral({ movements, totalDay, setForm, setEdit, setSelectedOption, currency, t }) {
  const [selectedRow, setSelectedRow] = useState(null);
  const [filteredData, setFilteredData] = useState(movements);

  const handleRowDoubleClick = (row) => {
    setSelectedRow(row);
    let type;
    switch (row.source.toLowerCase()) {
      case 'expense':
        document.querySelector('#movement_type').selectedIndex = 2;
        type = 2;
        break;
      case 'income':
        document.querySelector('#movement_type').selectedIndex = 1;
        type = 1;
        break;
      case 'balance':
        document.querySelector('#movement_type').selectedIndex = 8;
        type = 8;
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
      operate_for: row.log,
    };

    setForm(outputObject);
    setEdit(true);
    setSelectedOption(1);
  };

  // Group data by name and calculate sum based on filtered data
  const nameSummary = filteredData.reduce((acc, curr) => {
    const name = curr.name;
    if (!acc[name]) {
      acc[name] = {
        name: name,
        total: 0,
        currency: curr.currency,
        source: curr.source,
      };
    }
    acc[name].total += curr.val;
    return acc;
  }, {});

  // Format totals to 2 decimal places
  const nameSummaryArray = Object.values(nameSummary).map((item) => ({
    ...item,
    total: Number(item.total.toFixed(2)),
  }));

  return (
    <div>
      <InfoBanner {...{ data: totalDay, label: t('dailyExpenses') }} />
      <br />
      <Table
        label={t('movementTable')}
        columns={[t('date'), t('name'), t('value'), t('tag'), t('type'), t('id'), t('log')]}
        hiddenColumns={['id', 'Id', 'ID', 'log', 'Log', 'Log', 'Registro']}
        orderColumnsList={['datemov', 'name', 'val', 'tag', 'source', 'id', 'log']}
        data={movements}
        onRowDoubleClick={handleRowDoubleClick}
        onFilteredDataChange={setFilteredData}
      />
      <br />
      <Table
        label={t('nameSummaryTable')}
        data={nameSummaryArray}
        columns={[t('name'), t('type'), t('total')]}
        orderColumnsList={['name', 'source', 'total']}
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
  t: PropTypes.any,
};

export default TabGeneral;
