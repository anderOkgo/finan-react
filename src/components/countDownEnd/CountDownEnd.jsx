import { useEffect, useMemo, useState } from 'react';
import './countDownEnd.css';
import { monthDiff } from '../../helpers/operations';
import Table from '../Table/Table';
import cyfer from '../../helpers/cyfer';
import set from '../../helpers/set.json';

export default function CountDownEnd() {
  const dayIni = useMemo(() => new Date('11/20/2024 00:00:00'), []);
  const dayEnd = useMemo(() => new Date('01/20/2025 23:59:59'), []);

  const [timeTotal] = useState(calculateTime(dayEnd, dayIni));
  const [timeLeft, setTimeLeft] = useState(calculateTime(dayEnd, new Date()));
  const [timeNow, setTimeNow] = useState(calculateTime(new Date(), dayIni));
  const [timeMonthLeft, setTimeMonthLeft] = useState(monthDiff(new Date(), dayEnd));
  const [timeMonthNow, setTimeMonthNow] = useState(monthDiff(dayIni, new Date()));
  const [data, setData] = useState([]);

  useEffect(() => {
    try {
      var localResp = localStorage.getItem('count_down');
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

      var json = [
        {
          Total: timeTotal.toFixed(0),
          Elapsed: timeNow.toFixed(5),
          Remaining: timeLeft.toFixed(5),
        },
        {
          Total: (timeMonthNow + timeMonthLeft).toFixed(0),
          Elapsed: timeMonthNow.toFixed(2),
          Remaining: timeMonthLeft.toFixed(2),
        },
        {
          Total: '100%',
          Elapsed: `${((timeNow / timeTotal) * 100).toFixed(2)}%`,
          Remaining: `${((timeLeft / timeTotal) * 100).toFixed(2)}%`,
        },
      ];
      setData(json);
      localStorage.setItem('count_down', cyfer().cy(JSON.stringify(json), set.salt));
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, [timeTotal, timeLeft, timeNow, timeMonthLeft, timeMonthNow, dayEnd, dayIni]);

  function calculateTime(date1, date2) {
    return Math.abs(date1 - date2) / (1000 * 3600 * 24);
  }

  return <Table label={'Remaining Time Table'} data={data} />;
}
