import PropTypes from 'prop-types';
import { moneyFormat } from '../../helpers/operations';
import './InfoBanner.css';

export default function InfoBanner({ label, data, onDoubleClick }) {
  return (
    <div className="label-InfoBanner" onDoubleClick={onDoubleClick}>
      {label}: {moneyFormat(data)}
    </div>
  );
}
InfoBanner.propTypes = {
  data: PropTypes.number,
  label: PropTypes.string,
  onDoubleClick: PropTypes.func,
};
