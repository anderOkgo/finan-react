import PropTypes from 'prop-types';
import Form from '../Form/Form';
import Bank from '../InfoBanner/InfoBanner';

function TabInput({ setInit, init, setProc, proc, totalDay, setForm, form, edit, setEdit, currency }) {
  return (
    <div>
      <Bank {...{ setInit, init, setProc, proc, data: totalDay, label: 'Total Day' }} />
      <br />
      <h2>Movement Input</h2>
      <hr />
      <br />
      <Form {...{ setInit, init, setProc, proc, setForm, form, edit, setEdit, currency }} />
      <br />
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
  currency: PropTypes.any,
};

export default TabInput;
