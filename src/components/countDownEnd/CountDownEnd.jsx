import { useEffect, useState } from 'react';
import './countDownEnd.css';
import { monthDiff } from '../../helpers/operations';
import Table from '../Table/Table';
import cyfer from '../../helpers/cyfer';

export default function CountDownEnd() {
  const dayIni = new Date('03/14/2022 00:00:00');
  const dayEnd = new Date('03/15/2024 24:00:00');

  const [timeTotal] = useState(calculateTime(dayEnd, dayIni));
  const [timeLeft, setTimeLeft] = useState(calculateTime(dayEnd, new Date()));
  const [timeNow, setTimeNow] = useState(calculateTime(new Date(), dayIni));
  const [timeMonthLeft, setTimeMonthLeft] = useState(monthDiff(new Date(), dayEnd));
  const [timeMonthNow, setTimeMonthNow] = useState(monthDiff(dayIni, new Date()));
  const [data, setdData] = useState([]);

  useEffect(() => {
    try {
      var localResp = localStorage.getItem('times');
      localResp && (localResp = JSON.parse(cyfer().dcy(localResp, 'hola')));
      if (Object.keys(localResp || {}).length !== 0) {
        setdData(localResp);
      }
    } catch (error) {
      console.log(error);
    }
  }, [setdData]);

  useEffect(() => {
    let id = setInterval(() => {
      setTimeLeft(calculateTime(dayEnd, new Date()));
      setTimeNow(calculateTime(new Date(), dayIni));
      setTimeMonthLeft(monthDiff(new Date(), dayEnd));
      setTimeMonthNow(monthDiff(dayIni, new Date()));

      var json = [
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
          Elapsed: `${((timeNow / timeTotal) * 100).toFixed(2)}%`,
          Remaining: `${((timeLeft / timeTotal) * 100).toFixed(2)}%`,
        },
      ];
      setdData(json);
      localStorage.setItem('times', cyfer().cy(JSON.stringify(json), 'hola'));
    }, 1000);

    return () => {
      clearInterval(id);
    };
  }, [timeTotal, timeLeft, timeNow, timeMonthLeft, timeMonthNow]);

  function calculateTime(date1, date2) {
    return Math.abs(date1 - date2) / (1000 * 3600 * 24);
  }

  return <Table label={'Remaining Time Table'} data={data} />;
}
