import PropTypes from 'prop-types';
import CountDownEnd from '../CountDownEnd/CountDownEnd';
import Form from '../Form/Form';
import Bank from '../Bank/Bank';

function TabInput({ setInit, init, setProc, proc, totalDay, setForm, form, edit, setEdit }) {
  return (
    <div>
      <h2>Input Bank</h2>
      <hr />
      <Bank {...{ setInit, init, setProc, proc, data: totalDay, label: 'Total Day' }} />
      <br />
      <CountDownEnd />
      <br />
      <Form {...{ setInit, init, setProc, proc, setForm, form, edit, setEdit }} />
    </div>
  );
}

TabInput.propTypes = {
  handleRadioChange: PropTypes.func,
  selectedOption: PropTypes.number,
  setInit: PropTypes.func.isRequired,
  init: PropTypes.any,
  setProc: PropTypes.func.isRequired,
  proc: PropTypes.any,
  totalDay: PropTypes.any,
  setForm: PropTypes.any,
  form: PropTypes.any,
  edit: PropTypes.any,
  setEdit: PropTypes.any,
};

export default TabInput;
