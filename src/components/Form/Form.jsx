import { useState, useCallback, useMemo, useRef, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import DataService from '../../services/data.service';
import AutoDismissMessage from '../Message/AutoDismissMessage.jsx';
import Table from '../Table/Table';
import './Form.css';
import GlobalContext from '../../contexts/GlobalContext.jsx';

function Form({ setForm, form, edit, setEdit, currency, operateFor }) {
  const { setInit, init, setProc, proc, t } = useContext(GlobalContext);
  const [msg, setMsg] = useState('');
  const [bgColor, setBgColor] = useState('');
  const [visible, setVisible] = useState(false);
  const [off, setOff] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const buttonRef = useRef(null);

  const initialForm = useMemo(
    () => ({
      movement_name: '',
      movement_val: '',
      operate_for: '',
      movement_type: '',
      movement_date: '',
      movement_tag: '',
      currency: '',
    }),
    []
  );

  useEffect(() => {
    function readOfflineData() {
      const insertData = JSON.parse(localStorage.getItem('insert')) || [];
      const updateData = JSON.parse(localStorage.getItem('update')) || [];
      const deleteData = JSON.parse(localStorage.getItem('del')) || [];
      const mergedData = formatOffData([...insertData, ...updateData, ...deleteData]);
      setOff(mergedData);
    }
    readOfflineData();
  }, []);

  const handleResetForm = useCallback(() => {
    setForm(initialForm);
    setEdit(false);
  }, [initialForm, setForm, setEdit]);

  const message = (msgText, msgColor, msgVisible) => {
    setMsg(msgText);
    setBgColor(msgColor);
    setVisible(msgVisible);
  };

  const formatOffData = (data) => {
    return data.map((obj) => {
      if (obj.id === undefined) {
        obj.id = null;
      }
      if (obj.source === undefined) {
        obj.source = null;
      }
      return obj;
    });
  };

  const handleChangeInput = useCallback(
    (e) => {
      const { name, value } = e.target;

      const emojiRegex =
        /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{2500}-\u{257F}]/gu;

      if (emojiRegex.test(value)) {
        message(t('noEmoji'), 'var(--opposite-second-color)', true);
        return;
      }

      const sanitizedValue =
        name === 'movement_name' || name === 'movement_tag' ? value.replace(emojiRegex, '') : value;

      setForm((prevForm) => ({
        ...prevForm,
        [name]: sanitizedValue,
        currency: currency,
      }));
    },
    [currency, setForm, t]
  );

  useEffect(() => {
    setForm((prevForm) => ({
      ...prevForm,
      currency: currency,
    }));
  }, [currency, setForm]);

  const handleOfflineData = useCallback((type, data) => {
    data = formatOffData([data]);
    const existingData = JSON.parse(localStorage.getItem(type)) || [];
    existingData.push(data[0]);
    localStorage.setItem(type, JSON.stringify(existingData));
    setOff((prevOff) => [...prevOff, data[0]]);
  }, []);

  const handleBulkData = useCallback(
    async (type) => {
      const updatedData = [];
      for (const item of JSON.parse(localStorage.getItem(type)) || []) {
        const response = await DataService[type](item);
        message(response?.err?.response?.errors, 'var(--opposite-color)', true);
        response.err && updatedData.push(item) & setInit(false);
      }
      localStorage.setItem(type, JSON.stringify(updatedData));
      return updatedData;
    },
    [setInit]
  );

  const handleRowDoubleClick = useCallback(async () => {
    async function syncOfflineData() {
      if (init && !proc) {
        setProc(true);
        const updatedInsertArray = await handleBulkData('insert');
        const updatedUpdateArray = await handleBulkData('update');
        const UpdatedDeleteArray = await handleBulkData('del');
        let sum = [...updatedUpdateArray, ...updatedInsertArray, ...UpdatedDeleteArray];
        setOff(sum);
        if (sum?.length === 0) {
          message('Transaction successful', 'var(--success)', true);
          setInit(Date.now());
        } else {
          alert('Transaction failed');
          setInit(false);
        }
        setProc(false);
      } else {
        message('Transaction waiting', 'var(--warning)', true);
      }
    }
    syncOfflineData();
  }, [handleBulkData, proc, setInit, setProc, init]);

  const handleAction = useCallback(
    async (e, actionType) => {
      e.target instanceof HTMLFormElement && e.preventDefault();
      async function exeAction(actionType) {
        if (init && !proc) {
          setProc(true);
          setDisabled(true);
          off.length !== 0 && handleRowDoubleClick();
          const response = await DataService[actionType](form);
          if (response?.err) {
            message(response?.err.response.errors, 'var(--opposite-color)', true);
            handleOfflineData(actionType, form);
            setInit(false);
          } else {
            message('Transaction successful', 'var(--success)', true);
            setInit(Date.now());
          }
          setDisabled(false);
          setProc(false);
        } else {
          handleOfflineData(actionType, form);
          message('Transaction waiting', 'var(--warning)', true);
        }
        handleResetForm();
      }

      if (actionType === 'del') {
        window.confirm(`${t('areYouSure')} '${form.movement_name}'`) && exeAction(actionType);
      } else {
        actionType = edit ? 'update' : 'insert';
        exeAction(actionType);
      }
    },
    [edit, proc, setProc, handleResetForm, form, handleOfflineData, setInit, init, off, handleRowDoubleClick, t]
  );

  return (
    <div>
      <AutoDismissMessage msg={msg} bgColor={bgColor} duration={2000} visible={visible} setVisible={setVisible} />
      <form onSubmit={(e) => handleAction(e, '')}>
        <input type="hidden" name="currency" onChange={handleChangeInput} value={currency} />
        <div className="form-group">
          <label className="form-label" htmlFor="movement_name">
            {t('name')}
          </label>
          <input
            id="movement_name"
            type="text"
            className="form-control"
            name="movement_name"
            value={form.movement_name}
            onChange={handleChangeInput}
            maxLength="50"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="movement_val">
            {t('value')}
          </label>
          <input
            id="movement_val"
            type="number"
            className="form-control"
            name="movement_val"
            value={form.movement_val}
            onChange={handleChangeInput}
            required
            max="10000000000"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="movement_type">
            {t('type')}
          </label>
          <select
            id="movement_type"
            className="form-control select"
            name="movement_type"
            onChange={handleChangeInput}
            required
            value={form.movement_type}
            ref={buttonRef}
          >
            <option value="0">---</option>
            <option value="2">{t('expenses')}</option>
            <option value="1">{t('incomes')}</option>
            <option value="8">{t('balance')}</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="operate_for">
            {t('from')}
          </label>
          <select
            id="operate_for"
            className="form-control select"
            name="operate_for"
            onChange={handleChangeInput}
            value={form.operate_for}
            ref={buttonRef}
          >
            <option value="">---</option>
            {[...operateFor].map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="movement_date">
            {t('date')}
          </label>
          <input
            className="form-control"
            type="datetime-local"
            id="movement_date"
            name="movement_date"
            value={form.movement_date}
            onChange={handleChangeInput}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="movement_tag">
            {t('tag')}
          </label>
          <input
            id="movement_tag"
            type="text"
            className="form-control"
            name="movement_tag"
            value={form.movement_tag}
            onChange={handleChangeInput}
            maxLength="30"
            required
          />
        </div>

        <div className="form-group">
          <input type="submit" className="btn-primarys" value={t('submit')} disabled={disabled}></input>
          <input className="btn-primarys" type="reset" value={t('reset')} onClick={handleResetForm} />
          {edit && (
            <input
              className="delete-button"
              type="button"
              value={t('delete')}
              onClick={(e) => handleAction(e, 'del')}
            />
          )}
        </div>
      </form>
      {off.length !== 0 && (
        <Table
          label={t('offlineTable')}
          columns={[t('queue'), '', '', '', '', '', '', '', '...']}
          data={off}
          onRowDoubleClick={handleRowDoubleClick}
        />
      )}
    </div>
  );
}

Form.propTypes = {
  setForm: PropTypes.func.isRequired,
  form: PropTypes.object.isRequired,
  edit: PropTypes.bool.isRequired,
  setEdit: PropTypes.func.isRequired,
  currency: PropTypes.string.isRequired,
  operateFor: PropTypes.any.isRequired,
};

export default Form;
