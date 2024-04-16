import PropTypes from 'prop-types';
import Table from '../Table/Table';
import Bank from '../InfoBanner/InfoBanner';
import LineChart from '../Charts/LineChart';
import CountDownEnd from '../CountDownEnd/CountDownEnd';

function TabBalance({ setInit, init, setProc, proc, bankTotal, balance }) {
  return (
    <div>
      <Bank {...{ setInit, init, setProc, proc, data: bankTotal, label: 'Total Bank' }} />
      <br />
      <CountDownEnd />
      <br />
      <LineChart dataI={balance} height={280} />
      <br />
      <Table
        label={'Annual Table'}
        data={balance}
        columns={['#', 'Year', 'Month', 'Incomes', 'Expenses', 'TotalSave']}
        hiddenColumns={['currency']}
      />
      <br />
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
};

export default TabBalance;
