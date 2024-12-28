import PropTypes from 'prop-types';
import Form from '../Form/Form';
import InfoBanner from '../InfoBanner/InfoBanner';

function TabInput({ totalDay, setForm, form, edit, setEdit, currency, operateFor }) {
  return (
    <div>
      <InfoBanner {...{ data: totalDay, label: 'Daily Expenses' }} />
      <br />
      <h2>Movement Input</h2>
      <hr />
      <br />
      <Form {...{ setForm, form, edit, setEdit, currency, operateFor }} />
      <br />
    </div>
  );
}

TabInput.propTypes = {
  totalDay: PropTypes.number,
  setForm: PropTypes.func.isRequired,
  form: PropTypes.objectOf(PropTypes.any),
  edit: PropTypes.bool,
  setEdit: PropTypes.func.isRequired,
  currency: PropTypes.string,
  operateFor: PropTypes.any,
};

export default TabInput;
