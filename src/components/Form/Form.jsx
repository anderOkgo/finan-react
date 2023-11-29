import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import DataService from '../../services/data.service';
import AutoDismissMessage from '../Message/AutoDismissMessage.jsx';
import Table from '../Table/Table';

function Form({ setInit, init, setForm, form, proc, setProc, edit, setEdit }) {
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

  const [msg, setMsg] = useState('');
  const [bgColor, setBgColor] = useState('');
  const [visible, setVisible] = useState(false);
  const [off, setOff] = useState([]);
  const [disabled, setDisabled] = useState(false);

  const buttonRef = useRef(null);

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
    const insertData = JSON.parse(localStorage.getItem('insert')) || [];
    const updateData = JSON.parse(localStorage.getItem('update')) || [];
    const deleteData = JSON.parse(localStorage.getItem('del')) || [];
    const mergedData = formatOffData([...insertData, ...updateData, ...deleteData]);
    setOff(mergedData);
  }, []);

  const formatOffData = (data) => {
    return data.map((obj) => {
      if (obj.id === undefined || obj.source === undefined) {
        obj.id = null;
        obj.source = null;
      }
      return obj;
    });
  };

  const message = (msgText, msgColor, msgVisible) => {
    setMsg(msgText);
    setBgColor(msgColor);
    setVisible(msgVisible);
  };

  const handleReset = useCallback(() => {
    setForm(initialForm);
    setEdit(false);
  }, [initialForm, setForm, setEdit]);

  const handleChange = useCallback(
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
  }, [handleBulkData, proc, setInit, setProc, init]);

  const handleAction = useCallback(
    async (e, actionType) => {
      setDisabled(true);
      e.target instanceof HTMLFormElement ? e.preventDefault() : false;
      let isDeleted;
      actionType === 'del' ? (actionType = 'del') : (actionType = edit ? 'update' : 'insert');
      actionType === 'del' && (isDeleted = window.confirm(`Are you sure to delete: '${form.name}'`));
      if (init && !proc) {
        setProc(true);
        off.length !== 0 && handleRowDoubleClick();
        let response = {};
        if (actionType === 'del') {
          isDeleted ? (response = await DataService[actionType](form)) : (response.avoid = true);
        } else {
          response = await DataService[actionType](form);
        }

        if (response?.err) {
          setMsg('Transaction failed');
          setBgColor('red');
          if (actionType === 'del') {
            isDeleted && handleOfflineData(actionType, form);
          } else {
            handleOfflineData(actionType, form);
          }
          setInit(false);
        } else if (response?.avoid) {
          message('Cancelled', 'gray', true);
        } else {
          message('Transaction successful', 'green', true);
          setInit(Date.now());
        }
        handleReset();
        setProc(false);
      } else {
        if (actionType === 'del') {
          isDeleted && handleOfflineData(actionType, form);
        } else {
          handleOfflineData(actionType, form);
        }

        message('Transaction waiting', '#ab9f09', true);
        handleReset();
      }
      setDisabled(false);
    },
    [edit, proc, setProc, handleReset, form, handleOfflineData, setInit, init, off, handleRowDoubleClick]
  );

  return (
    <div>
      <AutoDismissMessage msg={msg} bgColor={bgColor} duration={3000} visible={visible} setVisible={setVisible} />
      <form onSubmit={(e) => handleAction(e, '')}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            className="form-control"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="val">Value</label>
          <input
            id="val"
            type="number"
            className="form-control"
            name="val"
            value={form.val}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="type">Type</label>
          <select
            id="type"
            className="form-control"
            name="type"
            onChange={handleChange}
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
          <label htmlFor="datemov">Date:</label>
          <input
            type="datetime-local"
            id="datemov"
            name="datemov"
            value={form.datemov}
            onChange={handleChange}
            required
          ></input>
        </div>

        <div className="form-group">
          <label htmlFor="tag">Tag:</label>
          <input
            id="tag"
            type="text"
            className="form-control"
            name="tag"
            value={form.tag}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <input type="submit" className="btn-primarys" disabled={disabled}></input>
          <input className="btn-primarys" type="reset" value="Reset" onClick={handleReset} />
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
