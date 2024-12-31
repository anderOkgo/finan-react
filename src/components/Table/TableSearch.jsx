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
    // Filter data based on search term
    const filteredResults = dataset.filter((item) =>
      Object.values(item)
        .filter((value) => value !== null && value !== undefined) // Exclude null or undefined values
        .some((value) => value.toString().toLowerCase().includes(newSearchTerm.toLowerCase()))
    );
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
        placeholder={t('searchPlaceholder')}
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
