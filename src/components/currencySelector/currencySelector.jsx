import PropTypes from 'prop-types';
import { generateUniqueId } from '../../helpers/operations';

const CurrencySelector = ({ setCurrency, currency }) => {
  // Function to handle currency change
  const handleCurrencyChange = (event) => {
    setCurrency(event.target.value);
  };

  const uniqueId = generateUniqueId();

  return (
    <div>
      <label htmlFor={uniqueId}>Select Currency:</label>
      <select id={uniqueId} className="search-box-input" value={currency} onChange={handleCurrencyChange}>
        <option value="COP">COP</option>
        <option value="AUD">AUD</option>
      </select>
    </div>
  );
};

CurrencySelector.propTypes = {
  setCurrency: PropTypes.func.isRequired,
  currency: PropTypes.string.isRequired,
};

export default CurrencySelector;
