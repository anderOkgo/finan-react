import PropTypes from 'prop-types';
import Table from '../Table/Table';
import InfoBanner from '../InfoBanner/InfoBanner';

function TabTag({ movementTag, totalDay, t }) {
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
