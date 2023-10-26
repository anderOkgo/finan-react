import PropTypes from 'prop-types';
import Table from '../Table/Table';

function TabTag({ movimentTag }) {
  return (
    <div>
      <Table label={'Tag Table'} data={movimentTag} columns={['Value', 'Year', '#', 'Month', 'Source', 'Tag']} />
    </div>
  );
}

TabTag.propTypes = {
  movimentTag: PropTypes.any, // Update with the correct prop type
};

export default TabTag;
