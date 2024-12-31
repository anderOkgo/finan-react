import PropTypes from 'prop-types';
import Table from '../Table/Table';
import InfoBanner from '../InfoBanner/InfoBanner';

function TabTag({ movementTag, totalDay, t }) {
  return (
    <div>
      <InfoBanner {...{ data: totalDay, label: t('dailyExpenses') }} />
      <br />
      <Table
        label={t('tagTable')} // Translated label for the table
        data={movementTag}
        columns={[t('year'), t('hashtag'), t('month'), t('source'), t('tag'), t('value')]} // Translated column headers
        hiddenColumns={['']}
        orderColumnsList={['year_mov', 'month_number_mov', 'month_mov', 'name_source', 'tag', 'montly_sum']}
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
