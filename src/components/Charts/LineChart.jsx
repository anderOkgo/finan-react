/* eslint-disable react-refresh/only-export-components */
import { Line } from 'react-chartjs-2';
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
};

// eslint-disable-next-line react/prop-types
function LineChart({ dataI }) {
  const dataFromAPI = dataI;
  const filteredData = dataFromAPI.filter((item) => item.year_number !== 2022);
  const labels = filteredData.map((item) => item.month_name);
  const dataset1Data = filteredData.map((item) => item.incomes);
  const dataset2Data = filteredData.map((item) => item.bills);

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
        label: 'Bills',
        data: dataset2Data,

        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };
  return <Line options={options} data={data} />;
}

export default LineChart;
