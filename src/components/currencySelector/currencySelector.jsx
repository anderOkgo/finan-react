import PropTypes from 'prop-types';
const CurrencySelector = ({ setCurrency, currency }) => {
  // Function to handle currency change
  const handleCurrencyChange = (event) => {
    setCurrency(event.target.value);
  };

  return (
    <div>
      <label>Select Currency:</label>
      <select value={currency} onChange={handleCurrencyChange}>
        <option value="COP">COP</option>
        <option value="AUD">AUD</option>
      </select>
    </div>
  );
};

CurrencySelector.propTypes = {
  setCurrency: PropTypes.func.isRequired,
  currency: PropTypes.func.isRequired,
};

export default CurrencySelector;
