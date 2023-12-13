import PropTypes from 'prop-types';
import { moneyFormat } from '../../helpers/operations';
import './InfoBanner.css';

export default function Bank({ label, data }) {
  return (
    <div className="label-bank">
      {label}: {moneyFormat(data)}
    </div>
  );
}
Bank.propTypes = {
  init: PropTypes.any,
  proc: PropTypes.any,
  data: PropTypes.any,
  label: PropTypes.any,
};
