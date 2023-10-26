import PropTypes from 'prop-types';
import Table from '../Table/Table';
import Bank from '../Bank/Bank';
import LineChart from '../Charts/LineChart';
import CountDownEnd from '../CountDownEnd/CountDownEnd';

function TabBalance({ setInit, init, setProc, proc, bankTotal, balance, movimentSources }) {
  return (
    <div>
      <Bank {...{ setInit, init, setProc, proc, data: bankTotal, label: 'Total Bank' }} />
      <br />
      <h2>Remaining Time Table </h2>
      <hr />
      <CountDownEnd />
      <h2>Annual Table </h2>
      <hr />
      <Table data={balance} columns={['#', 'Year', 'Month', 'Incomes', 'Bills', 'TotalGain']} />
      <LineChart dataI={balance} />
      <br />
      <h2>Source Table</h2>
      <hr />
      <Table data={movimentSources} columns={['Total', 'Year', '#', 'Month', 'Source']} />
    </div>
  );
}

TabBalance.propTypes = {
  setInit: PropTypes.func.isRequired,
  init: PropTypes.any,
  setProc: PropTypes.func.isRequired,
  proc: PropTypes.any,
  bankTotal: PropTypes.any,
  balance: PropTypes.array.isRequired,
  movimentSources: PropTypes.array.isRequired,
};

export default TabBalance;
