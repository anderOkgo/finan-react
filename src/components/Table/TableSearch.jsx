import { useState } from 'react';
import PropTypes from 'prop-types';
import set from '../../helpers/set.json';
import './TableSearch.css';
import { generateUniqueId } from '../../helpers/operations';
import { useContext } from 'react';
import GlobalContext from '../../contexts/GlobalContext';

function TableSearch({ setCurrentPage, setFilteredData, setItemsPerPage, dataset, itemsPerPage }) {
  const { t } = useContext(GlobalContext);
  const [searchTerm, setSearchTerm] = useState('');

  // Search functionality
  const handleSearch = (newSearchTerm) => {
    setCurrentPage(1);
    setSearchTerm(newSearchTerm);

    // Split the search term by commas and trim whitespace
    const searchTerms = newSearchTerm
      .split(',')
      .map((term) => term.trim().toLowerCase())
      .filter((term) => term.length > 0);

    // If no search terms, show all data
    if (searchTerms.length === 0) {
      setFilteredData(dataset);
      return;
    }

    // Filter data based on search terms
    const filteredResults = dataset.filter((item) => {
      const itemString = Object.values(item)
        .filter((value) => value !== null && value !== undefined)
        .map((value) => value.toString().toLowerCase())
        .join(' ');

      // Check if ALL search terms are found in the concatenated string
      return searchTerms.every((term) => itemString.includes(term));
    });

    setFilteredData(filteredResults);
  };

  const uniqueId = generateUniqueId();

  return (
    <div className="search-box">
      <label id={uniqueId}>
        {t('rows')}{' '}
        <select
          id={uniqueId}
          value={itemsPerPage}
          onChange={(e) => {
            setItemsPerPage(parseInt(e.target.value));
            setCurrentPage(1);
          }}
          className="search-box-input"
        >
          {set.table_select_row_numbers.map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </label>
      <input
        id={uniqueId + '1'}
        className="search-box-input"
        type="search"
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={`${t('searchPlaceholder')} ${t('commaSeparated')}`}
      />
    </div>
  );
}

TableSearch.propTypes = {
  setCurrentPage: PropTypes.func.isRequired,
  setFilteredData: PropTypes.func.isRequired,
  setItemsPerPage: PropTypes.func.isRequired,
  dataset: PropTypes.array.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
};

export default TableSearch;
