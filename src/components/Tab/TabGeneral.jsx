import PropTypes from 'prop-types';
import Table from '../Table/Table';
import { useState, useMemo } from 'react';
import InfoBanner from '../InfoBanner/InfoBanner';

function TabGeneral({ movements, remainingBudget = 0, setForm, setEdit, setSelectedOption, currency, t }) {
  const [selectedRow, setSelectedRow] = useState(null);
  const [filteredData, setFilteredData] = useState(movements);
  const [filteredNameData, setFilteredNameData] = useState(null);
  const [viewMode, setViewMode] = useState('monthly'); // 'monthly', 'daily', 'dailyNoToday'

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

  const handleBudgetDoubleClick = () => {
    setViewMode((prev) => {
      if (prev === 'monthly') return 'daily';
      if (prev === 'daily') return 'dailyNoToday';
      return 'monthly';
    });
  };

  const getBudgetDisplay = () => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const currentDay = today.getDate();

    if (viewMode === 'daily') {
      const days = Math.max(1, lastDay - currentDay + 1);
      return {
        value: remainingBudget / days,
        label: t('dailyAverageBudget'),
      };
    }

    if (viewMode === 'dailyNoToday') {
      const days = Math.max(1, lastDay - currentDay);
      return {
        value: remainingBudget / days,
        label: t('dailyAverageBudgetNoToday'),
      };
    }

    return {
      value: remainingBudget,
      label: t('remainingBudget'),
    };
  };

  const { value: displayBudget, label: displayLabel } = getBudgetDisplay();

  // Group data by name and calculate sum based on filtered data
  const nameSummaryArray = useMemo(() => {
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

    return Object.values(nameSummary).map((item) => ({
      ...item,
      total: Number(item.total.toFixed(2)),
    }));
  }, [filteredData]);

  // Group data by type and sum based on filteredNameData (or nameSummaryArray if not filtered yet)
  const typeSummaryArray = useMemo(() => {
    const sourceToSummarize = filteredNameData !== null ? filteredNameData : nameSummaryArray;
    const typeSummary = sourceToSummarize.reduce((acc, curr) => {
      const key = curr.source;
      if (!acc[key]) {
        acc[key] = {
          type: curr.source,
          total: 0,
          currency: curr.currency,
        };
      }
      acc[key].total += curr.total;
      return acc;
    }, {});

    return Object.values(typeSummary).map((item) => ({
      ...item,
      total: Number(item.total.toFixed(2)),
    }));
  }, [filteredNameData, nameSummaryArray]);

  return (
    <div>
      <InfoBanner data={displayBudget} label={displayLabel} onDoubleClick={handleBudgetDoubleClick} />
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
        onFilteredDataChange={setFilteredNameData}
      />
      <br />
      <Table
        label={t('typeSummaryTable')}
        data={typeSummaryArray}
        columns={[t('type'), t('total')]}
        orderColumnsList={['type', 'total']}
      />
      {selectedRow && true}
    </div>
  );
}

TabGeneral.propTypes = {
  movements: PropTypes.arrayOf(PropTypes.object).isRequired,
  remainingBudget: PropTypes.number,
  setForm: PropTypes.func,
  setEdit: PropTypes.func,
  setSelectedOption: PropTypes.func,
  currency: PropTypes.string,
  t: PropTypes.any,
};

export default TabGeneral;
