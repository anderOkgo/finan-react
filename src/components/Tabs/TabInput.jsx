import PropTypes from 'prop-types';
import CountDownEnd from '../CountDownEnd/CountDownEnd';
import Form from '../Form/Form';
import Bank from '../Bank/Bank';

function TabInput({ setInit, init, setProc, proc, totalDay }) {
  return (
    <div>
      <h2>Input Bank</h2>
      <hr />
      <Bank {...{ setInit, init, setProc, proc, data: totalDay, label: 'Total Day' }} />
      <br />
      <CountDownEnd />
      <br />
      <Form {...{ setInit, init, setProc, proc }} />
    </div>
  );
}

TabInput.propTypes = {
  handleRadioChange: PropTypes.func,
  selectedOption: PropTypes.number,
  setInit: PropTypes.func.isRequired,
  init: PropTypes.any, // Update with the correct prop type
  setProc: PropTypes.func.isRequired,
  proc: PropTypes.any, // Update with the correct prop type
  totalDay: PropTypes.any, // Update with the correct prop type
};

export default TabInput;
