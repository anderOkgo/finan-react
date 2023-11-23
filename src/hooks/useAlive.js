import set from '../helpers/set.json';
import DataLocalService from '../services/data.local.service';
import { useState, useEffect } from 'react';
import DataService from '../services/data.service';

export const useAlive = () => {
  const [init, setInit] = useState(false);
  const [proc, setProc] = useState(1);
  const [prevInit, setPrevInit] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!init) {
        setProc(true);
        const resp = await DataService.boot();
        setInit(resp?.err ? false : true);
        setProc(false);
      }

      let intervalId = '';
      setPrevInit(init);
      if (prevInit === 0) {
        intervalId = setTimeout(() => fetchData(), set.alive_setTimeout || 120000);
        DataLocalService.createCookie('startCook', '1');
        setPrevInit(init);
      }

      const handleOnline = () => {
        setInit(true);
      };

      const handleOffline = () => {
        setInit(false);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        clearTimeout(intervalId);
      };
    };

    fetchData();
  }, [init, prevInit]);

  return { init, setInit, proc, setProc };
};
