import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import DataService from '../../services/data.service';
import CountDownEnd from '../CountDownEnd/CountDownEnd';
import Form from '../Form/Form';
import Bank from '../Bank/Bank';
import Table from '../Table/Table';
import './Tabs.css';
import { formattedDate } from '../../helpers/operations';

function Tabs({ setInit, init, setProc, proc }) {
  const [bankTotal, setBankTotal] = useState(0);
  const [balance, setBalance] = useState([]);
  const [movimentSources, setMovimentSources] = useState([]);
  const [movimentTag, setMovimentTag] = useState([]);
  const [moviments, setMoviments] = useState([]);
  const [totalDay, setTotalDay] = useState([]);

  const [selectedOption, setSelectedOption] = useState(1);

  // Handle swipe gestures
  let startX = null;

  const handleTouchStart = (e) => {
    startX = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (startX === null) return;

    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - startX;
    const swipeThreshold = 120;

    if (deltaX > swipeThreshold) {
      // Swipe to the right, select the previous option
      setSelectedOption((prevOption) => Math.max(prevOption - 1, 1));
    } else if (deltaX < -swipeThreshold) {
      // Swipe to the left, select the next option
      setSelectedOption((prevOption) => Math.min(prevOption + 1, 4));
    }

    startX = null;
  };

  useEffect(() => {
    const fetchData = async () => {
      setProc(true);
      if (init) {
        try {
          const resp = await DataService.totalBank({ date: formattedDate() });
          if (!resp.err) {
            setMovimentSources(resp.movimentSources);
            setMovimentTag(resp.movimentTag);
            setMoviments(resp.moviments);
            setBankTotal(resp.tota_bank[0].total_bank || 0);
            setBalance(resp.balance);
            setTotalDay(resp.totalDay[0].Total_day || 0);
            setInit(true);
          }
        } catch (error) {
          console.error('An error occurred:', error);
        }
      }
      setProc(false);
    };

    fetchData();
  }, [init]);

  const handleRadioChange = (option) => {
    setSelectedOption(option);
  };

  return (
    <div className="tabs-area" id="swipeArea" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Input Tab */}
      <input
        onClick={() => handleRadioChange(1)}
        checked={selectedOption === 1}
        value="1"
        className="radio-tab"
        name="tab"
        type="radio"
        id="tab-one"
      />
      <label className="label-tab" htmlFor="tab-one">
        Input
      </label>
      <div className="panel-tab">
        <div className="section-tab">
          <div className="container">
            <h2>Input Bank</h2>
            <hr />
            <Bank {...{ setInit, init, setProc, proc, data: totalDay, label: 'Total Day' }} />
            <br />
            <CountDownEnd />
            <br />
            <Form {...{ setInit, init, setProc, proc }} />
          </div>
        </div>
      </div>

      {/* General Tab */}
      <input
        onClick={() => handleRadioChange(2)}
        checked={selectedOption === 2}
        value="2"
        className="radio-tab"
        name="tab"
        type="radio"
        id="tab-four"
      />
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
      <input
        onClick={() => handleRadioChange(3)}
        checked={selectedOption === 3}
        value="3"
        className="radio-tab"
        name="tab"
        type="radio"
        id="tab-three"
      />
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
      <input
        onClick={() => handleRadioChange(4)}
        checked={selectedOption === 4}
        value="4"
        className="radio-tab"
        name="tab"
        type="radio"
        id="tab-two"
      />
      <label className="label-tab" htmlFor="tab-two">
        Balance
      </label>
      <div className="panel-tab">
        <div className="section-tab">
          <div className="container">
            <h2>Monthly Balances</h2>
            <hr />
            <Bank {...{ setInit, init, setProc, proc, data: bankTotal, label: 'Total Bank' }} />
            <br />
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
