import PropTypes from 'prop-types';
import Form from '../Form/Form';
import InfoBanner from '../InfoBanner/InfoBanner';

function TabInput({ setInit, init, setProc, proc, totalDay, setForm, form, edit, setEdit, currency }) {
  return (
    <div>
      <InfoBanner {...{ data: totalDay, label: 'Total Day' }} />
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
  totalDay: PropTypes.number,
  setForm: PropTypes.func.isRequired,
  form: PropTypes.objectOf(PropTypes.string),
  edit: PropTypes.bool,
  setEdit: PropTypes.func.isRequired,
  currency: PropTypes.string,
};

export default TabInput;
