import PropTypes from 'prop-types';
import { useState, useCallback, useMemo } from 'react';
import DataService from '../../services/data.service';
import AutoDismissMessage from '../Message/AutoDismissMessage.jsx';
import Loader from '../Loader/Loader';

function Form({ setInit, init, setProc, proc }) {
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

  const [form, setForm] = useState(initialForm);
  const [msg, setMsg] = useState('');
  const [bgColor, setBgColor] = useState('');
  const [visible, setVisible] = useState(false);

  const handleReset = useCallback(() => {
    setForm(initialForm);
  }, [initialForm]);

  const handleChange = useCallback(
    (e) => {
      setForm({
        ...form,
        [e.target.name]: e.target.value,
      });
    },
    [form]
  );

  const handleInsert = useCallback(
    async (e) => {
      e.preventDefault();
      setProc(true);

      if (init) {
        e.target.reset();
        try {
          const response = await DataService.insert(form);
          if (response.err) {
            setMsg('Insertion failed');
            setBgColor('red');
            setVisible(true);
          } else {
            setMsg('Insertion successful');
            setBgColor('green');
            setInit(Date.now());
            setVisible(true);
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
    [form, init, setInit, setProc]
  );

  return (
    <div>
      <AutoDismissMessage msg={msg} bgColor={bgColor} duration={3000} visible={visible} setVisible={setVisible} />
      {proc && <Loader />}
      <form onSubmit={handleInsert}>
        <div className="form-group">
          <label htmlFor="name">name</label>
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
          <select id="type" className="form-control" name="type" onChange={handleChange} required>
            <option value="">---</option>
            <option value="1">Income</option>
            <option value="2">Bill</option>
            <option value="7">Saving</option>
            <option value="8">Balance</option>
            <option value="9">Tax return</option>
            <option value="10">GYG payment</option>
            <option value="11">Interest</option>
            <option value="12">Visa refund</option>
            <option value="13">Cash exchange</option>
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
};

export default Form;
