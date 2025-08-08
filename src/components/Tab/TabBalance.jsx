import PropTypes from 'prop-types';
import Table from '../Table/Table';
import InfoBanner from '../InfoBanner/InfoBanner';
import LineChart from '../Charts/LineChart';

function TabBalance({ bankTotal, balance, yearlyBalance, balanceUntilDate, monthlyExpensesUntilDay, t }) {
  return (
    <div>
      <InfoBanner {...{ data: bankTotal, label: t('totalBalance') }} />
      <br />
      <LineChart dataI={balance} height={280} t={t} />
      <br />
      <Table
        label={t('annualBalanceTable')}
        data={yearlyBalance}
        columns={[t('year'), t('incomes'), t('expenses'), t('totalSave')]}
        hiddenColumns={['currency', 'user']}
      />
      <br />
      <Table
        label={t('monthlyBalanceTable')}
        data={balance}
        columns={[t('year'), t('month'), t('incomes'), t('expenses'), t('totalSave')]}
        hiddenColumns={['currency', 'user', 'month_number']}
      />
      <br />
      <Table
        label={t('dailyBalanceTable')}
        columns={[t('date'), t('Balance'), t('total')]}
        hiddenColumns={['currency', 'user']}
        orderColumnsList={[]}
        data={balanceUntilDate?.filter((item) => item.detail !== 'final-trip') ?? []}
      />
      <Table
        label={t('monthlyExpensesUntilDay')}
        columns={[t('month'), t('total')]}
        hiddenColumns={['currency', 'user']}
        orderColumnsList={[]}
        data={monthlyExpensesUntilDay}
      />
    </div>
  );
}

TabBalance.propTypes = {
  bankTotal: PropTypes.number,
  balance: PropTypes.arrayOf(PropTypes.object).isRequired,
  yearlyBalance: PropTypes.arrayOf(PropTypes.object).isRequired,
  balanceUntilDate: PropTypes.arrayOf(PropTypes.object).isRequired,
  monthlyExpensesUntilDay: PropTypes.arrayOf(PropTypes.object).isRequired,
  t: PropTypes.any.isRequired,
};

export default TabBalance;
