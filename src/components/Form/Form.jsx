import { useState, useCallback, useMemo, useRef, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import DataService from '../../services/data.service';
import AutoDismissMessage from '../Message/AutoDismissMessage.jsx';
import Table from '../Table/Table';
import './Form.css';
import set from '../../helpers/set.json';
import GlobalContext from '../../contexts/GlobalContext.jsx';

function Form({ setForm, form, edit, setEdit, currency }) {
  const { setInit, init, setProc, proc, role } = useContext(GlobalContext);
  const [msg, setMsg] = useState('');
  const [bgColor, setBgColor] = useState('');
  const [visible, setVisible] = useState(false);
  const [off, setOff] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const [showSubtractFrom, setShowSubtractFrom] = useState(false);
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
    setShowSubtractFrom(false);
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
      setForm((prevForm) => ({
        ...prevForm,
        [name]: value,
        currency: currency,
      }));

      if (name === 'movement_type') setShowSubtractFrom(value !== '');
    },
    [currency, setForm]
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
        window.confirm(`Are you sure to delete: '${form.movement_name}'`) && exeAction(actionType);
      } else {
        actionType = edit ? 'update' : 'insert';
        exeAction(actionType);
      }
    },
    [edit, proc, setProc, handleResetForm, form, handleOfflineData, setInit, init, off, handleRowDoubleClick]
  );

  return (
    <div>
      <AutoDismissMessage msg={msg} bgColor={bgColor} duration={2000} visible={visible} setVisible={setVisible} />
      <form onSubmit={(e) => handleAction(e, '')}>
        <input type="hidden" name="currency" onChange={handleChangeInput} value={currency} />
        <div className="form-group">
          <label className="form-label" htmlFor="movement_name">
            Name
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
            Value
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
            Type
          </label>
          <select
            id="movement_type"
            className="form-control"
            name="movement_type"
            onChange={handleChangeInput}
            required
            value={form.movement_type}
            ref={buttonRef}
          >
            {set.form_type_options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {showSubtractFrom && role === 'admin' && (
          <div className="form-group">
            <label className="form-label" htmlFor="operate_for">
              For
            </label>
            <select
              id="operate_for"
              className="form-control"
              name="operate_for"
              onChange={handleChangeInput}
              value={form.operate_for}
              ref={buttonRef}
            >
              {set.form_substract_options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="movement_date">
            Date:
          </label>
          <input
            className="form-control"
            type="datetime-local"
            id="movement_date"
            name="movement_date"
            value={form.movement_date}
            onChange={handleChangeInput}
            required
          ></input>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="movement_tag">
            Tag:
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
          <input type="submit" className="btn-primarys" disabled={disabled}></input>
          <input className="btn-primarys" type="reset" value="Reset" onClick={handleResetForm} />
          {edit && (
            <input
              className="delete-button"
              type="button"
              value="Delete"
              onClick={(e) => handleAction(e, 'del')}
            />
          )}
        </div>
      </form>
      {off.length !== 0 && (
        <Table
          label={'Offline Table'}
          columns={['Queue', '', '', '', '', '', '', '...']}
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
};

export default Form;
