export const moneyFormat = (number) => {
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currencyFormatter.format(number);
};

export const monthDiff = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffInMilliseconds = d2 - d1;
  const millisecondsInDay = 24 * 60 * 60 * 1000;
  const totalDays = diffInMilliseconds / millisecondsInDay;
  return Math.floor(totalDays) / 30.5;
};
