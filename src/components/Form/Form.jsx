import PropTypes from 'prop-types';
import { useState, useCallback, useMemo, useRef } from 'react';
import DataService from '../../services/data.service';
import AutoDismissMessage from '../Message/AutoDismissMessage.jsx';
import Loader from '../Loader/Loader';

function Form({ setInit, init, setProc, proc, setForm, form, edit, setEdit }) {
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

  const handleReset = useCallback(() => {
    setForm(initialForm);
    setEdit(false);
  }, [initialForm, setForm, setEdit]);

  const handleDelete = useCallback(async () => {
    console.log(form);
    let isDelete = window.confirm(`¿Are you sure to delete it? '${form.id}'?`);

    if (isDelete) {
      try {
        let response;
        if (edit) {
          response = await DataService.del(form);
        }
        if (response.err) {
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
          if (response.err) {
            setMsg('Transaction failed');
            setBgColor('red');
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
        }
      } else {
        alert('Server idle');
        setInit(undefined);
      }

      setProc(false);
    },
    [form, init, setInit, setProc, edit]
  );

  return (
    <div>
      <AutoDismissMessage msg={msg} bgColor={bgColor} duration={3000} visible={visible} setVisible={setVisible} />
      {proc && <Loader />}
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
          <label htmlFor="type">Transaction type</label>
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
