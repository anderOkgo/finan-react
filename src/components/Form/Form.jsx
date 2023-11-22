import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import DataService from '../../services/data.service';
import AutoDismissMessage from '../Message/AutoDismissMessage.jsx';
import Table from '../Table/Table';
import checkCookieExistence from '../../services/data.local.service';

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

  const [off, setOff] = useState([]);

  useEffect(() => {
    const insertData = JSON.parse(localStorage.getItem('insert')) || [];
    const updateData = JSON.parse(localStorage.getItem('update')) || [];
    const deleteData = JSON.parse(localStorage.getItem('del')) || [];

    const mergedData = [...insertData, ...updateData, ...deleteData].map((obj) => {
      if (obj.id === undefined || obj.source === undefined) {
        obj.id = 0;
        obj.source = 0;
      }
      return obj;
    });

    setOff(mergedData);
  }, []);

  const handleOfflineData = useCallback(
    (type, data) => {
      const existingData = JSON.parse(localStorage.getItem(type)) || [];
      existingData.push(data);
      localStorage.setItem(type, JSON.stringify(existingData));
      setOff((prevOff) => [...prevOff, data]);
    },
    [setOff]
  );

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

  const [disabled, setDisabled] = useState(false);

  const handleAction = useCallback(
    async (e, actionType) => {
      e.target instanceof HTMLFormElement ? e.preventDefault() : false;
      if (!proc) {
        setDisabled(true);
        setProc(true);

        let response = {};
        const cookieNameToCheck = 'myCookie';
        const doesCookieExist = checkCookieExistence(cookieNameToCheck);
        if (doesCookieExist) {
          alert(`${cookieNameToCheck}  exists!`);
          if (actionType === 'del') {
            const isDelete = window.confirm(`Are you sure to delete: '${form.name}'`);
            isDelete ? (response = await DataService.del(form)) : false;
          } else {
            actionType = edit ? 'update' : 'insert';
            response = edit ? await DataService.update(form) : await DataService.insert(form);
          }
        } else {
          actionType = edit ? 'update' : 'insert';
          console.log(`${cookieNameToCheck} cookie does not exist.`);
          response.err = true;
        }

        if (response?.err) {
          setMsg('Transaction failed');
          setBgColor('red');
          handleOfflineData(actionType, form);
          setInit(false);
        } else {
          setMsg('Transaction successful');
          setBgColor('green');
          setInit(Date.now());
        }
      } else {
        setMsg('Transaction waiting');
        setBgColor('yellow');
        handleOfflineData(actionType, form);
        setInit(false);
      }
      setVisible(true);
      setProc(false);
      handleReset();
      setDisabled(false);
    },
    [form, setInit, edit, handleOfflineData, handleReset, setProc, proc, init]
  );

  const handleRowDoubleClick = async () => {
    if (!proc) {
      setProc(true);
      const updatedInsertArray = await handleBulkData('insert');
      const updatedUpdateArray = await handleBulkData('update');
      const UpdatedDeleteArray = await handleBulkData('del');
      let sum = [...updatedUpdateArray, ...updatedInsertArray, ...UpdatedDeleteArray];
      setOff(sum);
      if (sum?.length === 0) {
        setMsg('Transaction successful');
        setBgColor('green');
        setInit(Date.now());
      } else {
        setMsg('Offline');
        setBgColor('red');
        setInit(false);
      }
    } else {
      setMsg('Transaction waiting');
      setBgColor('yellow');
    }
    setVisible(true);
    setProc(false);
  };

  const handleBulkData = async (type) => {
    const localData = JSON.parse(localStorage.getItem(type)) || [];
    const updatedData = [];

    for (const item of localData) {
      const response = await DataService[type](item);
      response.err ? updatedData.push(item) & setInit(false) : false;
    }

    localStorage.setItem(type, JSON.stringify(updatedData));
    return updatedData;
  };

  return (
    <div>
      <AutoDismissMessage msg={msg} bgColor={bgColor} duration={2000} visible={visible} setVisible={setVisible} />
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
          columns={['Field', 'Field', 'Field', 'Field', 'Field', 'Field', 'Field']}
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
