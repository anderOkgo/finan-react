import PropTypes from 'prop-types';
import { useState } from 'react';
import Table from '../Table/Table';
import InfoBanner from '../InfoBanner/InfoBanner';

function TabTag({ movementTag, totalDay, t }) {
  const [filteredData, setFilteredData] = useState(movementTag);

  // Group data by tag and calculate sum based on filtered data
  const tagSummary = filteredData.reduce((acc, curr) => {
    const tag = curr.tag;
    if (!acc[tag]) {
      acc[tag] = {
        tag: tag,
        total: 0,
        currency: curr.currency,
      };
    }
    acc[tag].total += curr.montly_sum;
    return acc;
  }, {});

  const tagSummaryArray = Object.values(tagSummary);

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
        columns={[t('tag'), t('total')]}
        orderColumnsList={['tag', 'total']}
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
