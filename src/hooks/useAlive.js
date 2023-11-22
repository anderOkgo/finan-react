import set from '../helpers/set.json';
import createCookie from '../services/data.local.service';
import { useState, useEffect } from 'react';
import DataService from '../services/data.service';

export const useAlive = () => {
  const [init, setInit] = useState(false);
  const [proc, setProc] = useState(1);
  const [prevInit, setPrevInit] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!init) {
        setProc(true);
        const resp = await DataService.boot();
        setInit(resp?.err ? false : true);
        setProc(false);
      }

      let intervalId = '';
      if (prevInit === true) {
        intervalId = setTimeout(() => fetchData(), set.alive_setTimeout || 120000);
        createCookie('myCookie', '1');
        setPrevInit(init);
      }

      return () => {
        clearTimeout(intervalId);
      };
    };

    fetchData();
  }, [init, prevInit]);

  return { init, setInit, proc, setProc };
};
