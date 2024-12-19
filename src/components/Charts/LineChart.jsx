/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import PropTypes from 'prop-types';
import './LineChart.css';
import { generateUniqueId } from '../../helpers/operations';
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

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Balances',
    },
  },
  /*   scales: {
    x: {
      grid: {
        color: 'rgba(20, 13, 124, 0.1)', // Light gray grid lines
        lineWidth: 1, // Set grid line width
      },
      ticks: {
        color: 'rgb(0, 0, 0)', // Black labels for X axis
        font: {
          size: 14, // Font size for X axis labels
          family: 'Arial', // Font family for X axis labels
          weight: 'bold', // Font weight for X axis labels
        },
      },
    },
    y: {
      grid: {
        color: 'rgba(34, 43, 35, 0.1)', // Light gray grid lines
        lineWidth: 1, // Set grid line width
      },
      ticks: {
        color: 'rgb(46, 37, 37)', // Black labels for Y axis
        font: {
          size: 14, // Font size for Y axis labels
          family: 'Arial', // Font family for Y axis labels
          weight: 'bold', // Font weight for Y axis labels
        },
      },
    },
  }, */
};

function LineChart({ dataI = [], height }) {
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    setSelectedYear(currentYear.toString());
  }, []);

  const dataFromAPI = Array.isArray(dataI) ? dataI : [];
  const filteredData =
    selectedYear === ''
      ? dataFromAPI.filter((item) => item.year_number !== 2022)
      : dataFromAPI.filter((item) => item.year_number === parseInt(selectedYear));
  const labels = filteredData.map((item) => item.month_name);
  const dataset1Data = filteredData.map((item) => item.incomes);
  const dataset2Data = filteredData.map((item) => item.expenses);

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const years = [...new Set(dataFromAPI.map((item) => item.year_number))];

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

  const uniqueId = generateUniqueId();

  return (
    <div>
      <select className="select" id={uniqueId} value={selectedYear} onChange={handleYearChange}>
        <option value="">All Years</option>
        {years.map(
          (year) =>
            year !== 2022 && (
              <option key={year} value={year}>
                {year}
              </option>
            )
        )}
      </select>
      <Line className="line-chart" options={options} data={data} height={height} />
    </div>
  );
}

LineChart.propTypes = {
  dataI: PropTypes.array.isRequired,
  height: PropTypes.number.isRequired,
};

export default LineChart;
