import set from '../helpers/set.json';
import { useState, useEffect } from 'react';
import DataService from '../services/data.service';

export const useAlive = () => {
  const [init, setInit] = useState(false);
  const [proc, setProc] = useState(1);
  const [previnit, setPrevinit] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!init) {
        setProc(true);
        const resp = await DataService.boot();
        resp?.err ? setInit(false) : setInit(true);
        setProc(false);
      }
      let intervalId = '';

      if (previnit === true) {
        intervalId = setTimeout(fetchData, set.alive_setTimeout || 120000);
        setPrevinit(init);
      }

      return () => {
        clearTimeout(intervalId);
      };
    };

    fetchData();
  }, [init, previnit]);

  return { init, setInit, proc, setProc };
};
