import PropTypes from 'prop-types';
import Form from '../Form/Form';
import InfoBanner from '../InfoBanner/InfoBanner';

function TabInput({ totalDay, setForm, form, edit, setEdit, currency, operateFor, t }) {
  return (
    <div>
      <InfoBanner {...{ data: totalDay, label: t('dailyExpenses') }} />
      <br />
      <h2>{t('movementInput')}</h2>
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
  t: PropTypes.any,
};

export default TabInput;
