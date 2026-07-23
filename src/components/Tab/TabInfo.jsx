import PropTypes from 'prop-types';
import Table from '../Table/Table';
import InfoBanner from '../InfoBanner/InfoBanner';
import CountDownEnd from '../CountDownEnd/CountDownEnd';

function TabInfo({ tripInfo, exchangeCol, t }) {
  return (
    <div>
      <InfoBanner {...{ data: parseInt(exchangeCol?.['total']) ?? -1, label: t('totalExchangeCol') }} />
      <br />
      <CountDownEnd t={t} />
      <br />
      <InfoBanner {...{ data: tripInfo?.[5]?.['total'] ?? -1, label: t('totalFinalTrip') }} />
      <br />
      <Table
        label={t('tripsTable')}
        columns={[t('typeTrip'), t('total')]}
        hiddenColumns={[]}
        orderColumnsList={['detail', 'total']}
        data={tripInfo?.filter((item) => item.detail !== 'final-trip') ?? []}
        moneyColumns={['total']}
      />
      <br />
    </div>
  );
}

TabInfo.propTypes = {
  tripInfo: PropTypes.arrayOf(PropTypes.object).isRequired,
  exchangeCol: PropTypes.object.isRequired,
  t: PropTypes.any.isRequired,
};

export default TabInfo;
