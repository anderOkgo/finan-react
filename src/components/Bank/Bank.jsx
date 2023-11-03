import PropTypes from 'prop-types';
import { moneyFormat } from '../../helpers/operations';
import './Bank.css';

export default function Bank({ label, data }) {
  Bank.propTypes = {
    init: PropTypes.any,
    proc: PropTypes.any,
    data: PropTypes.any,
    label: PropTypes.any,
  };

  return (
    <div className="label-bank">
      {label}: {moneyFormat(data)}
    </div>
  );
}
