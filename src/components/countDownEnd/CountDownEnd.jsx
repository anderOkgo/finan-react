import { useEffect, useState } from 'react';
import './countDownEnd.css';
import { monthDiff } from '../../helpers/operations';
import Table from '../Table/Table';

export default function CountDownEnd() {
  const [timeTotal, setTimeTotal] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeNow, setTimeNow] = useState(0);
  const [timeMonthLeft, setTimeMonthLeft] = useState(0);
  const [timeMonthNow, setTimeMonthNow] = useState(0);
  const [data, setdData] = useState([]);

  useEffect(() => {
    let id = setInterval(() => {
      let dayIni = new Date('03/14/2022 00:00:00');
      let dayEnd = new Date('03/15/2024 24:00:00');
      let now = new Date();
      const calculateTime = (d1, d2) => Math.abs(d1 - d2) / (1000 * 3600 * 24);

      setTimeLeft(calculateTime(dayEnd, now));
      setTimeNow(calculateTime(now, dayIni));
      setTimeTotal(calculateTime(dayEnd, dayIni));
      setTimeMonthLeft(monthDiff(now, dayEnd));
      setTimeMonthNow(monthDiff(dayIni, now));
      let json = [
        {
          Total: timeTotal,
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
          Elapsed: `${((timeNow / timeTotal).toFixed(2) * 100).toFixed(2)}%`,
          Remaining: `${((timeLeft / timeTotal).toFixed(2) * 100).toFixed(2)}%`,
        },
      ];
      setdData(json);
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, [timeTotal, timeLeft, timeNow]);

  return <Table data={data} />;
}
