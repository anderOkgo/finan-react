import PropTypes from 'prop-types';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import DataService from '../../services/data.service';
import AutoDismissMessage from '../Message/AutoDismissMessage.jsx';
import Table from '../Table/Table';

function Form({ setInit, init, setProc, setForm, form, edit, setEdit }) {
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

  const [off, setOff] = useState(null);

  useEffect(() => {
    var arrayOff = [];
    if (localStorage.getItem('insert')) {
      arrayOff = [...arrayOff, ...JSON.parse(localStorage.getItem('insert'))];
    }
    if (localStorage.getItem('update')) {
      arrayOff = [...arrayOff, ...JSON.parse(localStorage.getItem('update'))];
    }
    arrayOff.forEach((obj, index) => {
      // eslint-disable-next-line no-prototype-builtins
      if (!obj.hasOwnProperty('id')) {
        arrayOff[index].id = null;
      }
    });
    setOff(arrayOff);
  }, []);

  const handleReset = useCallback(() => {
    setForm(initialForm);
    setEdit(false);
  }, [initialForm, setForm, setEdit]);

  const handleDelete = useCallback(async () => {
    console.log(form);
    let isDelete = window.confirm(`¿Are you sure to delete it? '${form.name}'?`);

    if (isDelete) {
      try {
        let response;
        if (edit) {
          response = await DataService.del(form);
        }
        if (response?.err) {
          setMsg('Transaction failed');
          setBgColor('red');
          setVisible(true);
        } else {
          setMsg('Transaction successful');
          setBgColor('green');
          setInit(Date.now());
          setVisible(true);
          handleReset();
          setEdit(false);
        }
      } catch (error) {
        console.error('An error occurred:', error);
        alert('Insertion failed');
      }
    } else {
      return;
    }
  }, [form, edit, handleReset, setInit, setEdit]);

  const handleChange = useCallback(
    (e) => {
      setForm({
        ...form,
        [e.target.name]: e.target.value,
      });
    },
    [form, setForm]
  );

  const handleInsert = useCallback(
    async (e) => {
      e.preventDefault();
      setProc(true);

      if (init) {
        e.target.reset();
        try {
          let response;
          if (edit) {
            response = await DataService.update(form);
          } else {
            response = await DataService.insert(form);
          }
          if (response?.err) {
            setMsg('Transaction failed');
            setBgColor('red');
            let local_data = '';
            edit ? (local_data = 'update') : (local_data = 'insert');
            if (localStorage.getItem(local_data)) {
              const existingArray = JSON.parse(localStorage.getItem(local_data));
              existingArray.push(form);
              localStorage.setItem(local_data, JSON.stringify(existingArray));
            } else {
              localStorage.setItem(local_data, JSON.stringify([form]));
            }
            setOff([...off, form]);

            setVisible(true);
          } else {
            setMsg('Transaction successful');
            setBgColor('green');
            setInit(Date.now());
            setVisible(true);
            handleReset();
          }
        } catch (error) {
          console.error('An error occurred:', error);
          alert('Insertion failed');
          let local_data = '';
          edit ? (local_data = 'update') : (local_data = 'insert');
          if (localStorage.getItem(local_data)) {
            const existingArray = JSON.parse(localStorage.getItem(local_data));
            existingArray.push(form);
            localStorage.setItem(local_data, JSON.stringify(existingArray));
          } else {
            localStorage.setItem(local_data, JSON.stringify([form]));
          }
          setOff([...off, form]);
        }
      } else {
        alert('Server idle');
        setInit(undefined);
        let local_data = '';
        edit ? (local_data = 'update') : (local_data = 'insert');
        if (localStorage.getItem(local_data)) {
          const existingArray = JSON.parse(localStorage.getItem(local_data));
          existingArray.push(form);
          localStorage.setItem(local_data, JSON.stringify(existingArray));
        } else {
          localStorage.setItem(local_data, JSON.stringify([form]));
        }
        setOff([...off, form]);
      }

      setProc(false);
    },
    [form, init, setInit, setProc, edit, handleReset, off]
  );

  const handleRowDoubleClick = async () => {
    setProc(true);
    if (init) {
      const updatedInsertArray = [];
      if (localStorage.getItem('insert')) {
        const insertArray = JSON.parse(localStorage.getItem('insert'));
        insertArray.forEach(async (item) => {
          try {
            const response = await DataService.insert(item);
            response.err ? updatedInsertArray.push(item) : setInit(Date.now());
          } catch (error) {
            updatedInsertArray.push(item);
          }
        });
        localStorage.setItem('insert', JSON.stringify(updatedInsertArray));
      }

      const updatedUpdateArray = [];
      if (localStorage.getItem('update')) {
        const insertArray = JSON.parse(localStorage.getItem('update'));
        insertArray.forEach(async (item) => {
          try {
            const response = await DataService.update(item);
            response.err ? updatedUpdateArray.push(item) : setInit(Date.now());
          } catch (error) {
            updatedUpdateArray.push(item);
          }
        });
        setOff([...updatedUpdateArray, ...updatedInsertArray]);
        localStorage.setItem('update', JSON.stringify(updatedUpdateArray));
      }
      setMsg('Transaction successful');
      setBgColor('green');
    }

    setProc(false);
  };

  return (
    <div>
      <AutoDismissMessage msg={msg} bgColor={bgColor} duration={3000} visible={visible} setVisible={setVisible} />
      <form onSubmit={handleInsert}>
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
          <input type="submit" className="btn-primarys"></input>
          <input className="btn-primarys" type="reset" value="Reset" onClick={handleReset} />
          {edit && <input className="delete-button" type="button" value="Delete" onClick={handleDelete} />}
        </div>
      </form>
      {off?.length !== 0 && (
        <Table
          label={'Offline Table'}
          columns={['id', 'name', 'val', 'tag', 'source', 'datemov']}
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
