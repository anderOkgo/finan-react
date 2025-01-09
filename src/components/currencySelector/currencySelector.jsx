import PropTypes from 'prop-types';
import { generateUniqueId } from '../../helpers/operations';

const CurrencySelector = ({ setCurrency, currency, t }) => {
  const handleCurrencyChange = (event) => {
    setCurrency(event.target.value);
  };

  const uniqueId = generateUniqueId();

  return (
    <sapn>
      <label style={{ fontWeight: 'bold', marginRight: '2px' }} htmlFor={uniqueId}>
        {t('selectCurrency')}
      </label>
      <select id={uniqueId} className="select" value={currency} onChange={handleCurrencyChange}>
        <option value="COP">COP</option>
        <option value="AUD">AUD</option>
      </select>
    </sapn>
  );
};

CurrencySelector.propTypes = {
  setCurrency: PropTypes.func.isRequired,
  currency: PropTypes.string.isRequired,
  t: PropTypes.any.isRequired,
};

export default CurrencySelector;
