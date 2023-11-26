import DataLocalService from '../services/data.local.service';
import { useState, useEffect } from 'react';
import DataService from '../services/data.service';

export const useAlive = () => {
  const [init, setInit] = useState(0);
  const [proc, setProc] = useState(1);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (online) {
        if (!init) {
          setProc(true);
          const resp = await DataService.boot();
          setInit(resp?.err ? false : true);
          setProc(false);
        }
      }

      init ? DataLocalService.createCookie('startCook', '1') : DataLocalService.deleteCookie('startCook');

      const handleOnline = () => {
        setOnline(true);
      };

      const handleOffline = () => {
        setOnline(false);
        setInit(false);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    };

    fetchData();
  }, [init, online]);

  return { init, setInit, proc, setProc };
};
