import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import DataService from '../../services/data.service';
import './Tabs.css';
import { formattedDate } from '../../helpers/operations';
import useSwipeableTabs from '../../hooks/useSwipeableTabs';
import TabInput from './TabInput';
import TabGeneral from './TabGeneral';
import TabTag from './TabTag';
import TabBalance from './TabBalance';
import cyfer from '../../helpers/cyfer';

function Tabs({ setInit, init, setProc, proc }) {
  const [bankTotal, setBankTotal] = useState(0);
  const [balance, setBalance] = useState([]);
  const [movimentSources, setMovimentSources] = useState([]);
  const [movimentTag, setMovimentTag] = useState([]);
  const [moviments, setMoviments] = useState([]);
  const [totalDay, setTotalDay] = useState([]);
  const [edit, setEdit] = useState(false);
  const [generalInfo, setGeneralInfo] = useState([]);
  const [exchangeCol, setExchangeCol] = useState([]);

  const { selectedOption, setSelectedOption, handleTouchStart, handleTouchEnd } = useSwipeableTabs(1, 4, 170);

  const initialForm = useMemo(
    () => ({
      name: '',
      val: '',
      type: '',
      datemov: '',
      tag: '',
    }),
    []
  );

  const [form, setForm] = useState(initialForm);

  const typeOptions = [
    { value: '', label: '---' },
    { value: '1', label: 'Income' },
    { value: '2', label: 'Bill' },
    { value: '7', label: 'Saving' },
    { value: '8', label: 'Balance' },
    { value: '9', label: 'Tax return' },
    { value: '10', label: 'GYG payment' },
    { value: '11', label: 'Interest' },
    { value: '12', label: 'Visa refund' },
    { value: '13', label: 'Cash exchange' },
  ];

  const tabsData = [
    {
      id: 1,
      label: 'Input',
      component: (
        <TabInput {...{ setInit, init, setProc, proc, totalDay, setForm, form, edit, setEdit, typeOptions }} />
      ),
    },
    {
      id: 2,
      label: 'General',
      component: <TabGeneral {...{ moviments, generalInfo, setForm, form, setEdit, setSelectedOption }} />,
    },
    {
      id: 3,
      label: 'Tag',
      component: <TabTag {...{ movimentTag, exchangeCol }} />,
    },
    {
      id: 4,
      label: 'Balance',
      component: <TabBalance {...{ setInit, init, setProc, proc, bankTotal, balance, movimentSources }} />,
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setProc(true);

      const writeData = (resp) => {
        const { tota_bank, balance, movimentSources, movimentTag, moviments, totalDay, generalInfo } = resp;
        setMovimentSources(movimentSources);
        setMovimentTag(movimentTag);
        setMoviments(moviments);
        setBankTotal(tota_bank?.[0]?.total_bank ?? 0);
        setBalance(balance);
        setTotalDay(totalDay?.[0]?.Total_day ?? 0);
        setGeneralInfo(generalInfo?.find((item) => item.detail === 'total-save-au'));
        setExchangeCol(generalInfo?.find((item) => item.detail === 'Exchange Colombia'));
      };

      try {
        var localResp = localStorage.getItem('resp');
        localResp && (localResp = JSON.parse(cyfer().dcy(localResp, 'hola')));
        if (Object.keys(localResp || {}).length !== 0) {
          writeData(localResp);
        }
      } catch (error) {
        console.log(error);
      }

      if (init) {
        const resp = await DataService.totalBank({ date: formattedDate() });
        if (!resp?.err) {
          localStorage.setItem('resp', cyfer().cy(JSON.stringify(resp), 'hola'));
          writeData(resp);
        }
      }
      setProc(false);
    };

    fetchData();
  }, [init, setProc]);

  const handleRadioChange = (option) => {
    setSelectedOption(option);
  };

  return (
    <div className="tabs-area" id="swipeArea" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {tabsData.map((tab) => (
        <React.Fragment key={tab.id}>
          <input
            onChange={() => handleRadioChange(tab.id)}
            onClick={() => handleRadioChange(tab.id)}
            checked={selectedOption === tab.id}
            value={tab.id}
            className="radio-tab"
            name="tab"
            type="radio"
            id={`tab-${tab.id}`}
          />
          <label className="label-tab" htmlFor={`tab-${tab.id}`}>
            {tab.label}
          </label>
          <div className="panel-tab">
            <div className="section-tab">
              <div className="container">{tab.component}</div>
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

Tabs.propTypes = {
  setInit: PropTypes.func.isRequired,
  init: PropTypes.any,
  setProc: PropTypes.func.isRequired,
  proc: PropTypes.any,
  setEdit: PropTypes.any,
};

export default Tabs;
