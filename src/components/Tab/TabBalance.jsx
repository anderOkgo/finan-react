import PropTypes from 'prop-types';
import Table from '../Table/Table';
import InfoBanner from '../InfoBanner/InfoBanner';
import LineChart from '../Charts/LineChart';

function TabBalance({ bankTotal, balance, balanceUntilDate }) {
  return (
    <div>
      <InfoBanner {...{ data: bankTotal, label: 'Total Balance' }} />
      <br />
      <LineChart dataI={balance} height={280} />
      <br />
      <Table
        label={'Annual Balance Table'}
        data={balance}
        columns={['#', 'Year', 'Month', 'Incomes', 'Expenses', 'TotalSave']}
        hiddenColumns={['currency', 'user']}
      />
      <br />
      <Table
        label={'Daily Balance Table'}
        columns={['Date', 'Balance', 'Total']}
        hiddenColumns={['currency', 'user']}
        orderColumnsList={[]}
        data={balanceUntilDate?.filter((item) => item.detail !== 'final-trip') ?? []}
      />
    </div>
  );
}

TabBalance.propTypes = {
  bankTotal: PropTypes.number,
  balance: PropTypes.arrayOf(PropTypes.object).isRequired,
  balanceUntilDate: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default TabBalance;
