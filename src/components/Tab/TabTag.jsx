import PropTypes from 'prop-types';
import Table from '../Table/Table';
import InfoBanner from '../InfoBanner/InfoBanner';

function TabTag({ movementTag, exchangeCol }) {
  return (
    <div>
      <InfoBanner {...{ data: parseInt(exchangeCol?.['total']) ?? -1, label: 'Total Exchange Col' }} />
      <br />
      <Table
        label={'Tag Table'}
        data={movementTag}
        columns={['Year', 'Month', 'Source', 'Tag', 'Value']}
        hiddenColumns={['month_number_mov']}
        orderColumnsList={['year_mov', 'month_mov', 'name_source', 'tag', 'montly_sum']}
      />
    </div>
  );
}

TabTag.propTypes = {
  movementTag: PropTypes.arrayOf(PropTypes.object).isRequired,
  exchangeCol: PropTypes.object.isRequired,
};

export default TabTag;
