import { useState, useEffect } from 'react';
import './ExchangeRate.css'; // Import the CSS file
import { helpHttp } from '../helpers/helpHttp';

const ExchangeRate = () => {
  const [dollarPrice, setDollarPrice] = useState(null);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        // Replace 'YOUR_API_KEY' with your actual API key from ExchangeRate-API or other providers
        const response = await helpHttp().get(
          'https://v6.exchangerate-api.com/v6/5ff10ac237e8f3cfce6883d9/latest/AUD'
        );
        const exchangeRateAUDtoCOP = response.conversion_rates.COP;
        setDollarPrice(exchangeRateAUDtoCOP);
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
      }
    };

    fetchExchangeRate();
  }, []);

  return (
    <div className="exchange-rate-container">
      {dollarPrice ? (
        <div className="exchange-rate-box">
          <h2 className="exchange-rate-heading">Current Dollar Price</h2>
          <p className="exchange-rate-value">1 AUD to COP: {dollarPrice.toFixed(2)}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default ExchangeRate;
