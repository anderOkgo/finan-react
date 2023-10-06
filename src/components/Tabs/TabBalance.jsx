import PropTypes from 'prop-types';
import Table from '../Table/Table';
import Bank from '../Bank/Bank';

function TabBalance({ setInit, init, setProc, proc, bankTotal, balance, movimentSources }) {
  return (
    <div>
      <h2>Table Moviments</h2>
      <hr />
      <Bank {...{ setInit, init, setProc, proc, data: bankTotal, label: 'Total Bank' }} />
      <br />
      <Table data={balance} columns={['Month', '#', 'Year', 'Incomes', 'Bills']} />
      <h2>Table Sources</h2>
      <hr />
      <Table data={movimentSources} columns={['Total', 'Year', '#', 'Month', 'Source']} />
    </div>
  );
}

TabBalance.propTypes = {
  setInit: PropTypes.func.isRequired,
  init: PropTypes.any, // Update with the correct prop type
  setProc: PropTypes.func.isRequired,
  proc: PropTypes.any, // Update with the correct prop type
  bankTotal: PropTypes.any, // Update with the correct prop type
  balance: PropTypes.array.isRequired, // Update with the correct prop type
  movimentSources: PropTypes.array.isRequired, // Update with the correct prop type
};

export default TabBalance;
