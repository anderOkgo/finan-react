import PropTypes from 'prop-types';
import Table from '../Table/Table';
import Bank from '../InfoBanner/InfoBanner';
import LineChart from '../Charts/LineChart';
import CountDownEnd from '../CountDownEnd/CountDownEnd';

function TabBalance({ setInit, init, setProc, proc, bankTotal, balance, movimentSources }) {
  return (
    <div>
      <Bank {...{ setInit, init, setProc, proc, data: bankTotal, label: 'Total Bank' }} />
      <br />
      <CountDownEnd />
      <br />
      <LineChart dataI={balance} />
      <br />
      <Table
        label={'Annual Table'}
        data={balance}
        columns={['#', 'Year', 'Month', 'Incomes', 'Bills', 'TotalSave']}
      />
      <br />
      <Table
        label={'Source Table'}
        data={movimentSources}
        columns={['Year', 'Month', 'Source', 'Total']}
        hiddenColumns={['month_number_mov']}
        orderColums={['year_mov', 'month_mov', 'name_source', 'total_monthly_sum']}
      />
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
