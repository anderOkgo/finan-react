import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import DataService from '../../services/data.service';
import AutoDismissMessage from '../Message/AutoDismissMessage.jsx';
import Table from '../Table/Table';
import './Form.css';

function Form({ setInit, init, setForm, form, proc, setProc, edit, setEdit }) {
  const [msg, setMsg] = useState('');
  const [bgColor, setBgColor] = useState('');
  const [visible, setVisible] = useState(false);
  const [off, setOff] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const buttonRef = useRef(null);
  const initialForm = useMemo(
    () => ({
      name: '',
      val: '',
      type: '',
      datemov: '',
      tag: '',
    }),
    []
  );

  const typeOptions = [
    { value: '', label: '---' },
    { value: '1', label: 'Income' },
    { value: '2', label: 'Bill' },
    { value: '7', label: 'Saving' },
    { value: '8', label: 'Balance' },
    { value: '9', label: 'Tax return' },
    { value: '10', label: 'GYG payment' },
    { value: '11', label: 'Interest' },
    { value: '12', label: 'Visa refund' },
    { value: '13', label: 'Cash exchange' },
  ];

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
      if (obj.id === undefined || obj.source === undefined) {
        obj.id = null;
        obj.source = null;
      }
      return obj;
    });
  };

  const handleChangeInput = useCallback(
    (e) => {
      setForm({
        ...form,
        [e.target.name]: e.target.value,
      });
    },
    [form, setForm]
  );

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
          message('Transaction successful', 'green', true);
          setInit(Date.now());
        } else {
          message('Offline', 'red', true);
          setInit(false);
        }
        setProc(false);
      } else {
        message('Transaction waiting', '#ab9f09', true);
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
            message('Transaction failed', 'red', true);
            handleOfflineData(actionType, form);
            setInit(false);
          } else {
            message('Transaction successful', 'green', true);
            setInit(Date.now());
          }
          setDisabled(false);
          setProc(false);
        } else {
          handleOfflineData(actionType, form);
          message('Transaction waiting', '#ab9f09', true);
        }
        handleResetForm();
      }

      if (actionType === 'del') {
        window.confirm(`Are you sure to delete: '${form.name}'`) && exeAction(actionType);
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
        <div className="form-group">
          <label className="form-label" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            type="text"
            className="form-control"
            name="name"
            value={form.name}
            onChange={handleChangeInput}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="val">
            Value
          </label>
          <input
            id="val"
            type="number"
            className="form-control"
            name="val"
            value={form.val}
            onChange={handleChangeInput}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="type">
            Type
          </label>
          <select
            id="type"
            className="form-control"
            name="type"
            onChange={handleChangeInput}
            required
            value={form.type}
            ref={buttonRef}
          >
            {typeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="datemov">
            Date:
          </label>
          <input
            className="form-control"
            type="datetime-local"
            id="datemov"
            name="datemov"
            value={form.datemov}
            onChange={handleChangeInput}
            required
          ></input>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="tag">
            Tag:
          </label>
          <input
            id="tag"
            type="text"
            className="form-control"
            name="tag"
            value={form.tag}
            onChange={handleChangeInput}
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
          columns={['Queue', '', '', '', '', '', '...']}
          data={off}
          onRowDoubleClick={handleRowDoubleClick}
        />
      )}
    </div>
  );
}

Form.propTypes = {
  setInit: PropTypes.func.isRequired,
  init: PropTypes.any,
  setProc: PropTypes.func.isRequired,
  proc: PropTypes.any,
  setForm: PropTypes.any,
  form: PropTypes.any,
  edit: PropTypes.any,
  setEdit: PropTypes.any,
};

export default Form;
