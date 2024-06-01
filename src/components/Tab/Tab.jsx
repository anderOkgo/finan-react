import React, { useEffect, useMemo, useState } from 'react';
import { formattedDate } from '../../helpers/operations';
import set from '../../helpers/set.json'; // Ensure set.json is properly defined
import DataService from '../../services/data.service';
import useSwipeableTabs from '../../hooks/useSwipeableTabs';
import TabInput from './TabInput';
import TabGeneral from './TabGeneral';
import TabTag from './TabTag';
import TabBalance from './TabBalance';
import TabInfo from './TabInfo';
import cyfer from '../../helpers/cyfer';
import CurrencySelector from '../currencySelector/currencySelector';
import './Tab.css';
import { useContext } from 'react';
import GlobalContext from '../../contexts/GlobalContext';

function Tab() {
  const { init, setProc, username, role } = useContext(GlobalContext);
  const [bankTotal, setBankTotal] = useState(0);
  const [balance, setBalance] = useState([]);
  const [yearlyBalance, setYearlyBalance] = useState([]);
  const [movementTag, setMovementTag] = useState([]);
  const [movements, setMovements] = useState([]);
  const [totalDay, setTotalDay] = useState(0);
  const [edit, setEdit] = useState(false);
  const [generalInfo, setGeneralInfo] = useState({});
  const [exchangeCol, setExchangeCol] = useState({});
  const [tripInfo, setTripInfo] = useState([]);
  const [balanceUntilDate, setBalanceUntilDate] = useState([]);
  const [currency, setCurrency] = useState('COP');
  const [nTab, setnTab] = useState(4);
  const { selectedOption, setSelectedOption, handleTouchStart, handleTouchEnd } = useSwipeableTabs(nTab, 170);
  const [userName] = useState(username);
  const [userRole] = useState(role);
  const [width, setWidth] = useState('20%');

  const initialForm = useMemo(
    () => ({
      movement_name: '',
      movement_val: '',
      substract_to: '',
      movement_type: '',
      movement_date: '',
      movement_tag: '',
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
      component: true && <TabInput {...{ totalDay, setForm, form, edit, setEdit, setCurrency, currency }} />,
    },
    {
      id: 2,
      icon: '☷',
      label: 'General',
      component: true && (
        <TabGeneral {...{ movements, totalDay, setForm, setEdit, setSelectedOption, currency }} />
      ),
    },
    {
      id: 3,
      icon: '♞',
      label: 'Tag',
      component: true && <TabTag {...{ movementTag, totalDay }} />,
    },
    {
      id: 4,
      icon: '❆',
      label: 'Balance',
      component: true && <TabBalance {...{ bankTotal, balance, yearlyBalance, balanceUntilDate }} />,
    },
  ];

  if (userRole === 'admin') {
    tabsData.push({
      id: 5,
      icon: '⚅',
      label: 'Info',
      component: true && <TabInfo {...{ tripInfo, generalInfo, exchangeCol }} />,
    });
  }

  useEffect(() => {
    setnTab(tabsData.length);
    const per = 100 / tabsData.length;
    setWidth(per + '%');
    const fetchData = async () => {
      setProc(true);

      const writeData = (resp) => {
        const {
          totalBank = [],
          balance = [],
          yearlyBalance = [],
          movementTag = [],
          movements = [],
          totalDay = [],
          generalInfo = [],
          tripInfo = [],
          balanceUntilDate = [],
        } = resp;
        const generalInfoFormat = Array.isArray(generalInfo) ? generalInfo : [];
        setMovementTag(movementTag);
        setMovements(movements);
        setBankTotal(totalBank?.[0]?.total_bank ?? -1);
        setBalance(balance);
        setYearlyBalance(yearlyBalance);
        setTotalDay(totalDay?.[0]?.Total_day ?? 0);
        setGeneralInfo(generalInfoFormat?.find((item) => item.detail === 'total-save-au'));
        setExchangeCol(generalInfoFormat?.find((item) => item.detail === 'Exchange Colombia'));
        setTripInfo(Array.isArray(tripInfo) ? tripInfo : []);
        setBalanceUntilDate(Array.isArray(balanceUntilDate) ? balanceUntilDate : []);
      };

      try {
        var localResp = localStorage.getItem('storage');
        localResp && (localResp = JSON.parse(cyfer().dcy(localResp, set.salt)));
        if (Object.keys(localResp || {}).length !== 0) {
          writeData(localResp);
        }
      } catch (error) {
        console.log(error);
      }

      if (init) {
        const resp = await DataService.initialLoad({ date: formattedDate(), currency: currency });
        if (!resp?.err) {
          localStorage.setItem('storage', cyfer().cy(JSON.stringify(resp), set.salt));
          writeData(resp);
        }
      }
      setProc(false);
    };

    fetchData();
  }, [init, setProc, currency, userName, tabsData.length]);

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
          <label className="label-tab" style={{ width: width }} htmlFor={`tab-${tab.id}`}>
            <pre>
              <span dangerouslySetInnerHTML={{ __html: tab.icon }} />
              <p className="small-text">{tab.label}</p>
            </pre>
          </label>
          <div className="panel-tab">
            <div className="section-tab">
              <div className="container-tab">
                {userRole === 'admin' ? <CurrencySelector {...{ setCurrency, currency }} /> : ''}
                {tab.component}
              </div>
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

export default Tab;
