import PropTypes from 'prop-types';
import { moneyFormat } from '../../helpers/operations';
import './InfoBanner.css';

export default function InfoBanner({ label, data }) {
  return (
    <div className="label-InfoBanner">
      {label}: {moneyFormat(data)}
    </div>
  );
}
InfoBanner.propTypes = {
  init: PropTypes.any,
  proc: PropTypes.any,
  data: PropTypes.any,
  label: PropTypes.any,
};
