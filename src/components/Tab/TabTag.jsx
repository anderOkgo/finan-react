import PropTypes from 'prop-types';
import { useState, useMemo } from 'react';
import Table from '../Table/Table';
import InfoBanner from '../InfoBanner/InfoBanner';

function TabTag({ movementTag, monthlyBudget, totalDay, t, userRole }) {
  const [filteredData, setFilteredData] = useState(movementTag);
  const [filteredTagData, setFilteredTagData] = useState(null);

  // Group data by tag and source, and calculate sum based on filtered data
  const tagSummaryArray = useMemo(() => {
    const tagSummary = filteredData.reduce((acc, curr) => {
      const key = `${curr.tag}-${curr.name_source}`;
      if (!acc[key]) {
        acc[key] = {
          tag: curr.tag,
          source: curr.name_source,
          total: 0,
          currency: curr.currency,
        };
      }
      acc[key].total += curr.montly_sum;
      return acc;
    }, {});

    return Object.values(tagSummary).map((item) => ({
      ...item,
      total: Number(item.total.toFixed(2)),
    }));
  }, [filteredData]);

  // Group data by type (name_source) and sum based on filteredTagData (or tagSummaryArray if not filtered yet)
  const typeSummaryArray = useMemo(() => {
    const sourceToSummarize = filteredTagData !== null ? filteredTagData : tagSummaryArray;
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
  }, [filteredTagData, tagSummaryArray]);

  return (
    <div>
      {userRole === 'admin' ? (
        <InfoBanner {...{ data: monthlyBudget ?? 0, label: t('monthlyBudget') }} />
      ) : (
        <InfoBanner {...{ data: totalDay, label: t('dailyExpenses') }} />
      )}
      <br />
      <Table
        label={t('tagTable')}
        data={movementTag}
        columns={[t('year'), t('month'), t('type'), t('tag'), t('value')]}
        hiddenColumns={['month_number_mov']}
        orderColumnsList={['month_number_mov', 'year_mov', 'month_mov', 'name_source', 'tag', 'montly_sum']}
        onFilteredDataChange={setFilteredData}
      />
      <br />
      <Table
        label={t('tagSummaryTable')}
        data={tagSummaryArray}
        columns={[t('tag'), t('type'), t('total')]}
        orderColumnsList={['tag', 'source', 'total']}
        onFilteredDataChange={setFilteredTagData}
      />
      <br />
      <Table
        label={t('typeSummaryTable')}
        data={typeSummaryArray}
        columns={[t('type'), t('total')]}
        orderColumnsList={['type', 'total']}
      />
    </div>
  );
}

TabTag.propTypes = {
  movementTag: PropTypes.arrayOf(PropTypes.object).isRequired,
  monthlyBudget: PropTypes.number,
  totalDay: PropTypes.number,
  t: PropTypes.any,
  userRole: PropTypes.string,
};

export default TabTag;
