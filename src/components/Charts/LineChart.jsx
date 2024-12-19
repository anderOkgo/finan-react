/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import PropTypes from 'prop-types';
import './LineChart.css';
import { generateUniqueId } from '../../helpers/operations';
//import { options } from './chartOptions'; // Import the options from the separate file
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function LineChart({ dataI = [], height }) {
  const [selectedYear, setSelectedYear] = useState('');
  const uniqueId = generateUniqueId();

  useEffect(() => {
    setSelectedYear(new Date().getFullYear().toString());
  }, []);

  const sortedData = useMemo(() => {
    return [...dataI].sort((a, b) => {
      if (a.year_number === b.year_number) {
        return a.month_number - b.month_number;
      }
      return a.year_number - b.year_number;
    });
  }, [dataI]);

  const filteredData = useMemo(() => {
    return selectedYear === ''
      ? sortedData.filter((item) => item.year_number !== 2022)
      : sortedData.filter((item) => item.year_number === parseInt(selectedYear));
  }, [selectedYear, sortedData]);

  const labels = filteredData.map((item) => item.month_name);
  const dataset1Data = filteredData.map((item) => item.incomes);
  const dataset2Data = filteredData.map((item) => item.expenses);

  const years = useMemo(() => [...new Set(dataI.map((item) => item.year_number))], [dataI]);

  const data = {
    labels,
    datasets: [
      {
        label: 'Incomes',
        data: dataset1Data,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Expenses',
        data: dataset2Data,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  return (
    <div>
      <select
        className="select"
        id={uniqueId}
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
      >
        <option value="">All Years</option>
        {years.map((year) =>
          year !== 2022 ? (
            <option key={year} value={year}>
              {year}
            </option>
          ) : null
        )}
      </select>
      <Line className="line-chart" /* options={options} */ data={data} height={height} />
    </div>
  );
}

LineChart.propTypes = {
  dataI: PropTypes.array.isRequired,
  height: PropTypes.number.isRequired,
};

export default LineChart;
