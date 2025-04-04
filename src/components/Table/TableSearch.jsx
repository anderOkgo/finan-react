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

    // If no search term, show all data
    if (!newSearchTerm.trim()) {
      setFilteredData(dataset);
      return;
    }

    // Check if the search term contains a plus sign
    if (newSearchTerm.includes('+')) {
      // Split by plus signs for OR search
      const searchTerms = newSearchTerm
        .split('+')
        .map((term) => term.trim().toLowerCase())
        .filter((term) => term.length > 0);

      // Filter data based on OR search terms
      const filteredResults = dataset.filter((item) => {
        const itemString = Object.values(item)
          .filter((value) => value !== null && value !== undefined)
          .map((value) => value.toString().toLowerCase())
          .join(' ');

        // Check if ANY of the search terms are found (OR)
        return searchTerms.some((term) => itemString.includes(term));
      });

      setFilteredData(filteredResults);
    } else {
      // Split by commas for AND search
      const searchTerms = newSearchTerm
        .split(',')
        .map((term) => term.trim().toLowerCase())
        .filter((term) => term.length > 0);

      // Filter data based on AND search terms
      const filteredResults = dataset.filter((item) => {
        const itemString = Object.values(item)
          .filter((value) => value !== null && value !== undefined)
          .map((value) => value.toString().toLowerCase())
          .join(' ');

        // Check if ALL search terms are found (AND)
        return searchTerms.every((term) => itemString.includes(term));
      });

      setFilteredData(filteredResults);
    }
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
        placeholder={`${t('searchPlaceholder')}`}
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
