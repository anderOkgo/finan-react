import PropTypes from 'prop-types';
import { moneyFormat } from '../../helpers/operations';
import Status from '../Status/Status';

export default function Bank({ init, proc, bankTotal }) {
  Bank.propTypes = {
    setInit: PropTypes.func.isRequired,
    init: PropTypes.any,
    setProc: PropTypes.func.isRequired,
    proc: PropTypes.any,
    bankTotal: PropTypes.any,
  };

  return (
    <div className="label-bank">
      <Status init={init} proc={proc} /> ToataBank: {moneyFormat(bankTotal)}
    </div>
  );
}
