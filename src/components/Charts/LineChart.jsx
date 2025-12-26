/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useMemo, useContext } from 'react';
import { Line } from 'react-chartjs-2';
import PropTypes from 'prop-types';
import './LineChart.css';
import { generateUniqueId } from '../../helpers/operations';
import GlobalContext from '../../contexts/GlobalContext';
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

function LineChart({ dataI = [], height, t }) {
  const { isDarkMode } = useContext(GlobalContext);
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

  const labels = filteredData.map((item) => t(item.month_name));
  const dataset1Data = filteredData.map((item) => item.incomes);
  const dataset2Data = filteredData.map((item) => item.expenses);

  const years = useMemo(() => [...new Set(dataI.map((item) => item.year_number))], [dataI]);

  const data = {
    labels,
    datasets: [
      {
        label: t('incomes'),
        data: dataset1Data,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: t('expenses'),
        data: dataset2Data,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: isDarkMode ? '#e0e0e0' : '#212121',
        },
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(18, 18, 18, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDarkMode ? '#e0e0e0' : '#212121',
        bodyColor: isDarkMode ? '#e0e0e0' : '#212121',
        borderColor: isDarkMode ? '#363c42' : '#b5cdda',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: isDarkMode ? '#e0e0e0' : '#212121',
        },
        grid: {
          color: isDarkMode ? 'rgba(224, 224, 224, 0.2)' : 'rgba(33, 33, 33, 0.1)',
          lineWidth: 1,
        },
        border: {
          color: isDarkMode ? 'rgba(224, 224, 224, 0.3)' : 'rgba(33, 33, 33, 0.2)',
        },
      },
      y: {
        ticks: {
          color: isDarkMode ? '#e0e0e0' : '#212121',
        },
        grid: {
          color: isDarkMode ? 'rgba(224, 224, 224, 0.2)' : 'rgba(33, 33, 33, 0.1)',
          lineWidth: 1,
        },
        border: {
          color: isDarkMode ? 'rgba(224, 224, 224, 0.3)' : 'rgba(33, 33, 33, 0.2)',
        },
      },
    },
  }), [isDarkMode]);

  return (
    <div>
      <select
        className="select"
        id={uniqueId}
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
      >
        <option value="">{t('allYears')}</option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
      <Line className="line-chart" options={options} data={data} height={height} />
    </div>
  );
}

LineChart.propTypes = {
  dataI: PropTypes.array.isRequired,
  height: PropTypes.number.isRequired,
  t: PropTypes.any.isRequired,
};

export default LineChart;
