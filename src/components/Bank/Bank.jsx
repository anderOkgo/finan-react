import PropTypes from 'prop-types';
import { moneyFormat } from '../../helpers/operations';

export default function Bank({ label, data }) {
  Bank.propTypes = {
    setInit: PropTypes.func.isRequired,
    init: PropTypes.any,
    setProc: PropTypes.func.isRequired,
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
