import PropTypes from 'prop-types';
import Table from '../Table/Table';
import InfoBanner from '../InfoBanner/InfoBanner';
import CountDownEnd from '../CountDownEnd/CountDownEnd';

function TabInfo({ tripInfo, generalInfo, exchangeCol }) {
  return (
    <div>
      <InfoBanner {...{ data: parseInt(generalInfo?.['total']) ?? -1, label: 'Total Save AU' }} />
      <br />
      <CountDownEnd />
      <br />
      <InfoBanner {...{ data: parseInt(exchangeCol?.['total']) ?? -1, label: 'Total Exchange Col' }} />
      <br />
      <Table
        label={'Trips Table'}
        columns={['Type Trip', 'Total']}
        hiddenColumns={[]}
        orderColumnsList={['detail', 'total']}
        data={tripInfo?.filter((item) => item.detail !== 'final-trip') ?? []}
      />
      <InfoBanner {...{ data: tripInfo?.[5]?.['total'] ?? -1, label: 'Total Final Trip' }} />
      <br />
    </div>
  );
}

TabInfo.propTypes = {
  tripInfo: PropTypes.PropTypes.arrayOf(PropTypes.object).isRequired,
  balanceUntilDate: PropTypes.arrayOf(PropTypes.object).isRequired,
  generalInfo: PropTypes.object.isRequired,
  exchangeCol: PropTypes.object.isRequired,
};

export default TabInfo;
