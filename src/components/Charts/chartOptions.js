const getCSSVar = (name) => typeof window !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue(name).trim() : '';

export const options = {
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Balances' },
  },
  scales: {
    x: {
      grid: { color: 'var(--black-alpha-10)', lineWidth: 1 },
      ticks: {
        color: 'var(--text-body)',
        font: { size: 14, family: 'Arial', weight: 'bold' },
      },
    },
    y: {
      grid: { color: 'var(--black-alpha-10)', lineWidth: 1 },
      ticks: {
        color: 'var(--text-body)',
        font: { size: 14, family: 'Arial', weight: 'bold' },
      },
    },
  },
};
