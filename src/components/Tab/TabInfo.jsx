import PropTypes from 'prop-types';
import Table from '../Table/Table';
import InfoBanner from '../InfoBanner/InfoBanner';

function TabInfo({ tripInfo, balanceUntilDate }) {
  return (
    <div>
      <InfoBanner {...{ data: tripInfo?.[5]?.['total'] ?? -1, label: 'Total Final Trip' }} />
      <br />
      <Table
        label={'Trips Table'}
        columns={['Type Trip', 'Total']}
        hiddenColumns={[]}
        orderColumnsList={['detail', 'total']}
        data={tripInfo?.filter((item) => item.detail !== 'final-trip') ?? []}
      />
      <br />
      <Table
        label={'Daily Balance'}
        columns={['Date', 'Balance', 'Total']}
        hiddenColumns={['currency']}
        orderColumnsList={[]}
        data={balanceUntilDate?.filter((item) => item.detail !== 'final-trip') ?? []}
      />
    </div>
  );
}

TabInfo.propTypes = {
  tripInfo: PropTypes.array,
  balanceUntilDate: PropTypes.array,
};

export default TabInfo;
