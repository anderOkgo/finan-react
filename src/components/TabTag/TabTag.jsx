import PropTypes from 'prop-types';
import Table from '../Table/Table';
import Bank from '../InfoBanner/InfoBanner';

function TabTag({ movimentTag, exchangeCol }) {
  return (
    <div>
      <Bank {...{ data: exchangeCol['total'], label: 'Total Exchange Col' }} />
      <br />
      <Table
        label={'Tag Table'}
        data={movimentTag}
        columns={['Year', 'Month', 'Source', 'Tag', 'Value']}
        hiddenColumns={['month_number_mov']}
        orderColums={['year_mov', 'month_mov', 'name_source', 'tag', 'montly_sum']}
      />
    </div>
  );
}

TabTag.propTypes = {
  movimentTag: PropTypes.any,
  exchangeCol: PropTypes.any,
};

export default TabTag;
