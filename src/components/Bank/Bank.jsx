import PropTypes from 'prop-types';
import { moneyFormat } from '../../helpers/operations';
import Status from '../Status/Status';

export default function Bank({ label, init, proc, data }) {
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
      <Status init={init} proc={proc} /> {label}: {moneyFormat(data)}
    </div>
  );
}
