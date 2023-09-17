import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import DataService from '../../services/data.service';
import CountDownEnd from '../CountDownEnd/CountDownEnd';
import Form from '../Form/Form';
import Bank from '../Bank/Bank';
import Table from '../Table/Table';
import Table2 from '../Table/Table2';
import './Tabs.css';

export default function Tabs({ setInit, init, setProc, proc }) {
  Tabs.propTypes = {
    setInit: PropTypes.func.isRequired,
    init: PropTypes.any,
    setProc: PropTypes.func.isRequired,
    proc: PropTypes.any,
  };

  const [bankTotal, setBankTotal] = useState(0);
  const [balance, setBalance] = useState([]);
  const [movimentSources, setMovimentSources] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setProc(true);
      if (init) {
        let resp = await DataService.totalBank();
        console.log(resp);
        setMovimentSources(resp.MovimentSources);
        resp.err
          ? setInit(false)
          : setBankTotal(resp.tota_bank[0] === undefined ? 0 : resp.tota_bank[0].total_bank);
        setBalance(resp.balance);

        setInit(true);
      }
      setProc(false);
    };

    fetchData();
  }, [init]);

  return (
    <div className="tabs-area">
      <input className="radio-tab" name="tab" type="radio" id="tab-one" defaultChecked="checked" />
      <label className="label-tab" htmlFor="tab-one">
        Input
      </label>
      <div className="panel-tab">
        <div className="section-tab">
          <div className="container">
            <h2>Remaining time</h2>
            <hr />
            <CountDownEnd />
            <br />
            <Bank setInit={setInit} init={init} setProc={setProc} proc={proc} bankTotal={bankTotal} />
            <br />
            <Form setInit={setInit} init={init} setProc={setProc} proc={proc} />
          </div>
        </div>
      </div>

      <input className="radio-tab" name="tab" type="radio" id="tab-two" />
      <label className="label-tab" htmlFor="tab-two">
        Balance
      </label>
      <div className="panel-tab">
        <div className="section-tab">
          <div className="container">
            <h2>Monthly Balances</h2>
            <hr />
            <Table balance={balance} />
          </div>
        </div>
      </div>

      <input className="radio-tab" name="tab" type="radio" id="tab-three" />
      <label className="label-tab" htmlFor="tab-three">
        Source
      </label>
      <div className="panel-tab">
        <div className="section-tab">
          <div className="container">
            <h2>Table Sources</h2>
            <hr />
            <Table2 movimentSources={movimentSources} />
          </div>
        </div>
      </div>

      <input className="radio-tab" name="tab" type="radio" id="tab-four" />
      <label className="label-tab" htmlFor="tab-four">
        resume
      </label>
      <div className="panel-tab">
        <div className="section-tab">
          <div className="container">
            <h2>Title4</h2>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis consequuntur unde rem assumenda
              distinctio labore impedit tenetur natus eos voluptatem quaerat vero veritatis dicta temporibus
              maxime, error, soluta molestias perferendis?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
