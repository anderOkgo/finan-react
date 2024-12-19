export const options = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Balances' },
  },
  scales: {
    x: {
      grid: { color: 'rgba(20, 13, 124, 0.1)', lineWidth: 1 },
      ticks: {
        color: 'rgb(0, 0, 0)',
        font: { size: 14, family: 'Arial', weight: 'bold' },
      },
    },
    y: {
      grid: { color: 'rgba(34, 43, 35, 0.1)', lineWidth: 1 },
      ticks: {
        color: 'rgb(46, 37, 37)',
        font: { size: 14, family: 'Arial', weight: 'bold' },
      },
    },
  },
};
