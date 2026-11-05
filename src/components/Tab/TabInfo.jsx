import PropTypes from 'prop-types';
import Table from '../Table/Table';
import InfoBanner from '../InfoBanner/InfoBanner';

const NO_DATA = -1;
const orNoData = (value) => (Number.isFinite(value) ? value : NO_DATA);

function TabInfo({ tripInfo, exchangeCol, t }) {
  const finalTrip = tripInfo?.find((item) => item.detail === 'final-trip');

  return (
    <div>
      <InfoBanner {...{ data: orNoData(parseInt(exchangeCol?.['total'])), label: t('totalExchangeCol') }} />
      <br />
      <InfoBanner {...{ data: orNoData(parseFloat(finalTrip?.total)), label: t('totalFinalTrip') }} />
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
