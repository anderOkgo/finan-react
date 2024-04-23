import PropTypes from 'prop-types';
import Table from '../Table/Table';
import InfoBanner from '../InfoBanner/InfoBanner';
import LineChart from '../Charts/LineChart';
import CountDownEnd from '../CountDownEnd/CountDownEnd';

function TabBalance({ bankTotal, balance }) {
  return (
    <div>
      <InfoBanner {...{ data: bankTotal, label: 'Total Bank' }} />
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
  bankTotal: PropTypes.number,
  balance: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default TabBalance;
