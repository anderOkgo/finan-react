import PropTypes from 'prop-types';
import { useState } from 'react';
const CurrencySelector = ({ setCurrency }) => {
  const [selectedCurrency, setSelectedCurrency] = useState('COP');

  // Function to handle currency change
  const handleCurrencyChange = (event) => {
    setSelectedCurrency(event.target.value);
    setCurrency(event.target.value);
  };

  return (
    <div>
      <label htmlFor="currencySelector">Select Currency:</label>
      <select id="currencySelector" value={selectedCurrency} onChange={handleCurrencyChange}>
        <option value="COP">COP</option>
        <option value="AUD">AUD</option>
      </select>
    </div>
  );
};

CurrencySelector.propTypes = {
  setCurrency: PropTypes.func.isRequired,
};

export default CurrencySelector;
