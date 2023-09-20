import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import DataService from '../../services/data.service';
import CountDownEnd from '../CountDownEnd/CountDownEnd';
import Form from '../Form/Form';
import Bank from '../Bank/Bank';
import Table from '../Table/Table';
import './Tabs.css';

function Tabs({ setInit, init, setProc, proc }) {
  const [bankTotal, setBankTotal] = useState(0);
  const [balance, setBalance] = useState([]);
  const [movimentSources, setMovimentSources] = useState([]);
  const [movimentTag, setMovimentTag] = useState([]);
  const [moviments, setMoviments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setProc(true);
      if (init) {
        try {
          const resp = await DataService.totalBank();
          if (!resp.err) {
            setMovimentSources(resp.movimentSources);
            setMovimentTag(resp.movimentTag);
            setMoviments(resp.moviments);
            setBankTotal(resp.tota_bank[0]?.total_bank || 0);
            setBalance(resp.balance);
            setInit(true);
          } else {
            setInit(false);
          }
        } catch (error) {
          console.error('An error occurred:', error);
          setInit(false);
        }
      }
      setProc(false);
    };

    fetchData();
  }, [init]);

  return (
    <div className="tabs-area">
      {/* Input Tab */}
      <input className="radio-tab" name="tab" type="radio" id="tab-one" defaultChecked="checked" />
      <label className="label-tab" htmlFor="tab-one">
        Input
      </label>
      <div className="panel-tab">
        <div className="section-tab">
          <div className="container">
            <h2>Input Bank</h2>
            <hr />
            <Bank {...{ setInit, init, setProc, proc, bankTotal }} />
            <br />
            <CountDownEnd />
            <br />
            <Form {...{ setInit, init, setProc, proc }} />
          </div>
        </div>
      </div>

      {/* General Tab */}
      <input className="radio-tab" name="tab" type="radio" id="tab-four" />
      <label className="label-tab" htmlFor="tab-four">
        General
      </label>
      <div className="panel-tab">
        <div className="section-tab">
          <div className="container">
            <h2>Table Moviments</h2>
            <hr />
            <Table data={moviments} />
          </div>
        </div>
      </div>

      {/* Tag Tab */}
      <input className="radio-tab" name="tab" type="radio" id="tab-three" />
      <label className="label-tab" htmlFor="tab-three">
        Tag
      </label>
      <div className="panel-tab">
        <div className="section-tab">
          <div className="container">
            <h2>Table Tag</h2>
            <hr />
            <Table data={movimentTag} columns={['Value', 'Year', '#', 'Month', 'Source', 'Tag']} />
          </div>
        </div>
      </div>

      {/* Balance Tab */}
      <input className="radio-tab" name="tab" type="radio" id="tab-two" />
      <label className="label-tab" htmlFor="tab-two">
        Balance
      </label>
      <div className="panel-tab">
        <div className="section-tab">
          <div className="container">
            <h2>Monthly Balances</h2>
            <hr />
            <Table data={balance} columns={['Month', '#', 'Year', 'Incomes', 'Bills']} />
            <h2>Table Sources</h2>
            <hr />
            <Table data={movimentSources} columns={['Total', 'Year', '#', 'Month', 'Source']} />
          </div>
        </div>
      </div>
    </div>
  );
}

Tabs.propTypes = {
  setInit: PropTypes.func.isRequired,
  init: PropTypes.any,
  setProc: PropTypes.func.isRequired,
  proc: PropTypes.any,
};

export default Tabs;
