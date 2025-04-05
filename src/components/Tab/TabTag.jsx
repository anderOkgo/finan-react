import PropTypes from 'prop-types';
import { useState } from 'react';
import Table from '../Table/Table';
import InfoBanner from '../InfoBanner/InfoBanner';

function TabTag({ movementTag, totalDay, t }) {
  const [filteredData, setFilteredData] = useState(movementTag);

  // Group data by tag and source, and calculate sum based on filtered data
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

  // Format totals to 2 decimal places
  const tagSummaryArray = Object.values(tagSummary).map((item) => ({
    ...item,
    total: Number(item.total.toFixed(2)),
  }));

  return (
    <div>
      <InfoBanner {...{ data: totalDay, label: t('dailyExpenses') }} />
      <br />
      <Table
        label={t('tagTable')}
        data={movementTag}
        columns={[t('year'), t('month'), t('source'), t('tag'), t('value')]}
        hiddenColumns={['month_number_mov']}
        orderColumnsList={['month_number_mov', 'year_mov', 'month_mov', 'name_source', 'tag', 'montly_sum']}
        onFilteredDataChange={setFilteredData}
      />
      <br />
      <Table
        label={t('tagSummaryTable')}
        data={tagSummaryArray}
        columns={[t('tag'), t('source'), t('total')]}
        orderColumnsList={['tag', 'source', 'total']}
      />
    </div>
  );
}

TabTag.propTypes = {
  movementTag: PropTypes.arrayOf(PropTypes.object).isRequired,
  totalDay: PropTypes.number,
  t: PropTypes.any,
};

export default TabTag;
