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

  // State to store resolved colors from CSS variables
  const [chartColors, setChartColors] = useState({
    incomes: 'rgb(53, 162, 235)',
    expenses: 'rgb(255, 99, 132)',
    text: isDarkMode ? '#e0e0e0' : '#212121',
    border: isDarkMode ? '#363c42' : '#b5cdda',
    tooltipBg: isDarkMode ? 'rgba(18, 18, 18, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    grid: isDarkMode ? 'rgba(224, 224, 224, 0.1)' : 'rgba(33, 33, 33, 0.1)',
    tickBorder: isDarkMode ? 'rgba(224, 224, 224, 0.2)' : 'rgba(33, 33, 33, 0.2)',
  });

  // Effect to resolve CSS variables AFTER the theme effect has run
  useEffect(() => {
    // We use a small timeout or requestAnimationFrame to ensure the DOM has updated
    // although usually a simple useEffect after the theme state change is enough
    const resolveColors = () => {
      const root = document.documentElement;
      const getVar = (name) => getComputedStyle(root).getPropertyValue(name).trim();

      setChartColors({
        incomes: getVar('--chart-incomes') || 'rgb(53, 162, 235)',
        expenses: getVar('--chart-expenses') || 'rgb(255, 99, 132)',
        text: getVar('--text-body'),
        border: getVar('--border-subtle'),
        tooltipBg: getVar('--white-alpha-90'),
        grid: isDarkMode ? getVar('--white-alpha-10') : getVar('--black-alpha-10'),
        tickBorder: isDarkMode ? getVar('--white-alpha-20') : getVar('--black-alpha-20'),
      });
    };

    // Execute immediately and maybe again after a frame to be safe
    resolveColors();
    const timer = setTimeout(resolveColors, 50); // Small buffer for CSS variables to apply
    return () => clearTimeout(timer);
  }, [isDarkMode]);

  const data = useMemo(() => {
    const toRGBA = (rgb, alpha) => {
      if (!rgb || !rgb.startsWith('rgb')) return rgb;
      return rgb.replace('rgb', 'rgba').replace(')', `, ${alpha})`);
    };

    return {
      labels,
      datasets: [
        {
          label: t('incomes'),
          data: dataset1Data,
          borderColor: chartColors.incomes,
          backgroundColor: toRGBA(chartColors.incomes, 0.5),
        },
        {
          label: t('expenses'),
          data: dataset2Data,
          borderColor: chartColors.expenses,
          backgroundColor: toRGBA(chartColors.expenses, 0.5),
        },
      ],
    };
  }, [labels, t, dataset1Data, dataset2Data, chartColors.incomes, chartColors.expenses]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: chartColors.text,
          },
        },
        tooltip: {
          backgroundColor: chartColors.tooltipBg,
          titleColor: chartColors.text,
          bodyColor: chartColors.text,
          borderColor: chartColors.border,
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          ticks: {
            color: chartColors.text,
          },
          grid: {
            color: chartColors.grid,
            lineWidth: 1,
          },
          border: {
            color: chartColors.tickBorder,
          },
        },
        y: {
          ticks: {
            color: chartColors.text,
          },
          grid: {
            color: chartColors.grid,
            lineWidth: 1,
          },
          border: {
            color: chartColors.tickBorder,
          },
        },
      },
    }),
    [chartColors]
  );

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
      <Line key={isDarkMode} className="line-chart" options={options} data={data} height={height} />
    </div>
  );
}

LineChart.propTypes = {
  dataI: PropTypes.array.isRequired,
  height: PropTypes.number.isRequired,
  t: PropTypes.any.isRequired,
};

export default LineChart;
