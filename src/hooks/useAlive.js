import { useState, useEffect } from 'react';
import DataService from '../services/data.service';

export const useAlive = () => {
  const [init, setInit] = useState(false);
  const [proc, setProc] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!init) {
        setProc(true);
        const resp = await DataService.boot();
        resp?.err ? setInit(false) : setInit(true);
        setProc(false);
      }
    };

    fetchData();
  }, [init, proc]);

  return { init, setInit, proc, setProc };
};
