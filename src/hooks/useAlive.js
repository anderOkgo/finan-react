import { useState, useEffect } from 'react';
import DataService from '../services/data.service';

export const useAlive = () => {
  const [init, setInit] = useState(false);
  const [proc, setProc] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!init) {
        setProc(true);
        const resp = await DataService.boot();
        resp.err ? setInit(false) : setInit(resp);
        setProc(false);
      }
    };

    let timerId = fetchData();

    return () => {
      clearTimeout(timerId);
    };
  }, [init]);

  return { init, setInit, proc, setProc };
};
