import PropTypes from 'prop-types';
import Table from '../Table/Table';
import Bank from '../Bank/Bank';

function TabTag({ movimentTag, exchangeCol }) {
  return (
    <div>
      <Bank {...{ data: exchangeCol['total'], label: 'Total Exchange Col' }} />
      <br />
      <Table label={'Tag Table'} data={movimentTag} columns={['Value', 'Year', '#', 'Month', 'Source', 'Tag']} />
    </div>
  );
}

TabTag.propTypes = {
  movimentTag: PropTypes.any,
  exchangeCol: PropTypes.any,
};

export default TabTag;
