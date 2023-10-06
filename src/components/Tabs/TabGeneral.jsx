import PropTypes from 'prop-types';
import Table from '../Table/Table';

function TabGeneral({ moviments }) {
  return (
    <div>
      <h2>Table Moviments</h2>
      <hr />
      <Table data={moviments} />
    </div>
  );
}

TabGeneral.propTypes = {
  moviments: PropTypes.any, // Update with the correct prop type
};

export default TabGeneral;
