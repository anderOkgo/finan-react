import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import DataService from '../../services/data.service';
import './Tab.css';
import { formattedDate } from '../../helpers/operations';
import useSwipeableTabs from '../../hooks/useSwipeableTabs';
import TabInput from '../TabInput/TabInput';
import TabGeneral from '../TabGeneral/TabGeneral';
import TabTag from '../TabTag/TabTag';
import TabBalance from '../TabBalance/TabBalance';
import cyfer from '../../helpers/cyfer';
import set from '../../helpers/set.json';
import TabInfo from '../TabInfo/TabInfo';

function Tab({ setInit, init, setProc, proc }) {
  const [bankTotal, setBankTotal] = useState(0);
  const [balance, setBalance] = useState([]);
  const [movementSources, setMovementSources] = useState([]);
  const [movementTag, setMovementTag] = useState([]);
  const [movements, setMovements] = useState([]);
  const [totalDay, setTotalDay] = useState([]);
  const [edit, setEdit] = useState(false);
  const [generalInfo, setGeneralInfo] = useState([]);
  const [exchangeCol, setExchangeCol] = useState([]);
  const [tripInfo, setTripInfo] = useState([]);
  const [balanceUntilDate, setBalanceUntilDate] = useState([]);
  const [currency, setCurrency] = useState('AUD');
  const { selectedOption, setSelectedOption, handleTouchStart, handleTouchEnd } = useSwipeableTabs(1, 5, 170);

  const initialForm = useMemo(
    () => ({
      name: '',
      val: '',
      type: '',
      datemov: '',
      tag: '',
      currency: currency,
    }),
    [currency]
  );

  const [form, setForm] = useState(initialForm);

  const tabsData = [
    {
      id: 1,
      icon: '☰',
      label: 'Input',
      component: true && (
        <TabInput
          {...{ setInit, init, setProc, proc, totalDay, setForm, form, edit, setEdit, setCurrency, currency }}
        />
      ),
    },
    {
      id: 2,
      icon: '☷',
      label: 'General',
      component: selectedOption === 2 && (
        <TabGeneral {...{ movements, generalInfo, setForm, form, setEdit, setSelectedOption }} />
      ),
    },
    {
      id: 3,
      icon: '♞',
      label: 'Tag',
      component: selectedOption === 3 && <TabTag {...{ movementTag, exchangeCol }} />,
    },
    {
      id: 4,
      icon: '❆',
      label: 'Balance',
      component: selectedOption === 4 && (
        <TabBalance {...{ setInit, init, setProc, proc, bankTotal, balance, movementSources }} />
      ),
    },
    {
      id: 5,
      icon: '⚅',
      label: 'Info',
      component: selectedOption === 5 && (
        <TabInfo {...{ setInit, init, setProc, proc, bankTotal, balance, tripInfo, balanceUntilDate }} />
      ),
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setProc(true);

      const writeData = (resp) => {
        const {
          total_bank,
          balance,
          movementSources,
          movementTag,
          movements,
          totalDay,
          generalInfo,
          tripInfo,
          balanceUntilDate,
        } = resp;
        setMovementSources(movementSources);
        setMovementTag(movementTag);
        setMovements(movements);
        setBankTotal(total_bank?.[0]?.total_bank ?? 0);
        setBalance(balance);
        setTotalDay(totalDay?.[0]?.Total_day ?? 0);
        setGeneralInfo(generalInfo?.find((item) => item.detail === 'total-save-au'));
        setExchangeCol(generalInfo?.find((item) => item.detail === 'Exchange Colombia'));
        setTripInfo(tripInfo);
        setBalanceUntilDate(balanceUntilDate);
      };

      try {
        var localResp = localStorage.getItem('resp');
        localResp && (localResp = JSON.parse(cyfer().dcy(localResp, set.salt)));
        if (Object.keys(localResp || {}).length !== 0) {
          writeData(localResp);
        }
      } catch (error) {
        console.log(error);
      }

      if (init) {
        const resp = await DataService.totalBank({ date: formattedDate(), currency: currency });
        if (!resp?.err) {
          localStorage.setItem('resp', cyfer().cy(JSON.stringify(resp), set.salt));
          writeData(resp);
        }
      }
      setProc(false);
    };

    fetchData();
  }, [init, setProc, currency]);

  const handleTabClick = (tabId) => {
    setSelectedOption(tabId);
  };

  return (
    <div className="area-tab" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {tabsData.map((tab) => (
        <React.Fragment key={tab.id}>
          <input
            onChange={() => handleTabClick(tab.id)}
            onClick={() => handleTabClick(tab.id)}
            checked={selectedOption === tab.id}
            value={tab.id}
            className="radio-tab"
            name="tab"
            type="radio"
            id={`tab-${tab.id}`}
          />
          <label className="label-tab" htmlFor={`tab-${tab.id}`}>
            <pre>
              <span dangerouslySetInnerHTML={{ __html: tab.icon }} />
              <p className="small-text">{tab.label}</p>
            </pre>
          </label>
          <div className="panel-tab">
            <div className="section-tab">
              <div className="container-tab">{tab.component}</div>
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

Tab.propTypes = {
  setInit: PropTypes.func.isRequired,
  init: PropTypes.any,
  setProc: PropTypes.func.isRequired,
  proc: PropTypes.any,
  setEdit: PropTypes.any,
};

export default Tab;
