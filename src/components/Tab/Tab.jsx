import React, { useEffect, useMemo, useState } from 'react';
import { formattedDate } from '../../helpers/operations';
import set from '../../helpers/set.json'; // Ensure set.json is properly defined
import DataService from '../../services/data.service';
import AuthService from '../../services/auth.service';
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
  const { init, setProc, username, role, language, toggleLanguage, saveLanguageAsDefault, restoreLanguageDefault, t } = useContext(GlobalContext);
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
  const [monthlyExpensesUntilDay, setMonthlyExpensesUntilDay] = useState([]);
  const [currency, setCurrency] = useState('COP');
  const [nTab, setnTab] = useState(4);
  const { selectedOption, setSelectedOption, handleTouchStart, handleTouchEnd } = useSwipeableTabs(nTab, 170);
  const [userName] = useState(username);
  const [userRole] = useState(role);
  const [width, setWidth] = useState('20%');
  const [operateFor, setOperatefor] = useState('');

  const initialForm = useMemo(
    () => ({
      movement_name: '',
      movement_val: '',
      operate_for: '',
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
      label: t('inputTab'),
      component: true && (
        <TabInput {...{ totalDay, setForm, form, edit, setEdit, setCurrency, currency, operateFor, t }} />
      ),
    },
    {
      id: 2,
      icon: '☷',
      label: t('generalTab'),
      component: true && (
        <TabGeneral {...{ movements, totalDay, setForm, setEdit, setSelectedOption, currency, t }} />
      ),
    },
    {
      id: 3,
      icon: '♞',
      label: t('tagTab'),
      component: true && <TabTag {...{ movementTag, totalDay, t }} />,
    },
    {
      id: 4,
      icon: '❆',
      label: t('balanceTab'),
      component: true && (
        <TabBalance {...{ bankTotal, balance, yearlyBalance, balanceUntilDate, monthlyExpensesUntilDay, t }} />
      ),
    },
  ];

  if (userRole === 'admin') {
    tabsData.push({
      id: 5,
      icon: '⚅',
      label: t('infoTab'),
      component: true && <TabInfo {...{ tripInfo, generalInfo, exchangeCol, t }} />,
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
          totalExpenseDay = [],
          movements = [],
          movementTag = [],
          totalBalance = [],
          yearlyBalance = [],
          monthlyBalance = [],
          balanceUntilDate = [],
          generalInfo = [],
          tripInfo = [],
          monthlyExpensesUntilDay = [],
        } = resp;
        const generalInfoFormat = Array.isArray(generalInfo) ? generalInfo : [];
        setTotalDay(totalExpenseDay?.[0]?.Total_day ?? 0);
        setMovements(movements);
        setMovementTag(movementTag);
        setBankTotal(totalBalance?.[0]?.total_bank ?? -1);
        setYearlyBalance(yearlyBalance);
        setBalance(monthlyBalance);
        setBalanceUntilDate(Array.isArray(balanceUntilDate) ? balanceUntilDate : []);
        setGeneralInfo(generalInfoFormat?.find((item) => item.detail === 'total-save-au'));
        setExchangeCol(generalInfoFormat?.find((item) => item.detail === 'Exchange Colombia'));
        setTripInfo(Array.isArray(tripInfo) ? tripInfo : []);
        setOperatefor(movements.filter((item) => item.source === 'balance'));
        setMonthlyExpensesUntilDay(Array.isArray(monthlyExpensesUntilDay) ? monthlyExpensesUntilDay : []);
      };

      try {
        var localResp = localStorage.getItem('storage');
        localResp && (localResp = JSON.parse(cyfer().dcy(localResp, set.salt)));
        if (Object.keys(localResp || {}).length !== 0) writeData(localResp.data);
      } catch (error) {
        console.log(error);
      }

      if (init) {
        const resp = await DataService.initialLoad({ date: formattedDate(), currency: currency });
        if (!resp?.err) {
          localStorage.setItem('storage', cyfer().cy(JSON.stringify(resp), set.salt));
          writeData(resp.data);
        } else if (resp?.err?.status === 401) {
          AuthService.logout();
        }
      }
      setProc(false);
    };

    fetchData();
  }, [init, setProc, currency, userName, tabsData.length]);

  const handleTabClick = (tabId) => {
    setSelectedOption(tabId);
  };

  const handleLanguageDoubleClick = () => {
    // Verificar si hay una preferencia guardada
    const hasStoredPreference = localStorage.getItem('lang') !== null;
    
    if (hasStoredPreference) {
      // Si hay preferencia guardada, restaurar el default del sistema
      restoreLanguageDefault();
      alert(t('languageSystemDefault') || 'Language: System Default');
    } else {
      // Si no hay preferencia guardada, guardar la actual como default
      saveLanguageAsDefault();
      alert(t('languageUserDefault') || 'Language: User Default');
    }
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
                <div className="lang-container">
                  <span 
                    className="lang" 
                    onClick={toggleLanguage}
                    onDoubleClick={handleLanguageDoubleClick}
                  >
                    {language === 'en' ? t('switchToSpanish') : t('switchToEnglish')}
                  </span>
                  {userRole === 'admin' ? <CurrencySelector {...{ setCurrency, currency, t }} /> : ''}
                </div>
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
