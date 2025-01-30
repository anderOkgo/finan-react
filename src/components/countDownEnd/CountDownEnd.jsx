import { useEffect, useMemo, useState } from 'react';
import './countDownEnd.css';
import PropTypes from 'prop-types'; // Import PropTypes
import { monthDiff } from '../../helpers/operations';
import Table from '../Table/Table';
import cyfer from '../../helpers/cyfer';
import set from '../../helpers/set.json';

export default function CountDownEnd({ t }) {
  const dayIni = useMemo(() => new Date('11/20/2024 00:00:00'), []);
  const dayEnd = useMemo(() => new Date('01/31/2025 23:59:59'), []);

  const [timeTotal] = useState(calculateTime(dayEnd, dayIni));
  const [timeLeft, setTimeLeft] = useState(calculateTime(dayEnd, new Date()));
  const [timeNow, setTimeNow] = useState(calculateTime(new Date(), dayIni));
  const [timeMonthLeft, setTimeMonthLeft] = useState(monthDiff(new Date(), dayEnd));
  const [timeMonthNow, setTimeMonthNow] = useState(monthDiff(dayIni, new Date()));
  const [data, setData] = useState([]);

  useEffect(() => {
    try {
      let localResp = localStorage.getItem('count_down');
      localResp && (localResp = JSON.parse(cyfer().dcy(localResp, set.salt)));
      if (Object.keys(localResp || {}).length !== 0) {
        setData(localResp);
      }
    } catch (error) {
      console.log(error);
    }
  }, [setData]);

  useEffect(() => {
    let id = setInterval(() => {
      setTimeLeft(calculateTime(dayEnd, new Date()));
      setTimeNow(calculateTime(new Date(), dayIni));
      setTimeMonthLeft(monthDiff(new Date(), dayEnd));
      setTimeMonthNow(monthDiff(dayIni, new Date()));

      const json = [
        {
          [t('total')]: timeTotal.toFixed(0),
          [t('elapsed')]: timeNow.toFixed(5),
          [t('remaining')]: timeLeft.toFixed(5),
        },
        {
          [t('total')]: (timeMonthNow + timeMonthLeft).toFixed(2),
          [t('elapsed')]: timeMonthNow.toFixed(2),
          [t('remaining')]: timeMonthLeft.toFixed(2),
        },
        {
          [t('total')]: '100%',
          [t('elapsed')]: `${((timeNow / timeTotal) * 100).toFixed(2)}%`,
          [t('remaining')]: `${((timeLeft / timeTotal) * 100).toFixed(2)}%`,
        },
      ];
      setData(json);
      localStorage.setItem('count_down', cyfer().cy(JSON.stringify(json), set.salt));
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, [t, timeTotal, timeLeft, timeNow, timeMonthLeft, timeMonthNow, dayEnd, dayIni]);

  function calculateTime(date1, date2) {
    return Math.abs(date1 - date2) / (1000 * 3600 * 24);
  }

  return <Table label={t('remainingTimeTable')} data={data} />;
}

CountDownEnd.propTypes = {
  t: PropTypes.func.isRequired,
};
