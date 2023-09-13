import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import DataService from '../../services/data.service';

export default function Form({ setInit, init, setProc }) {
  Form.propTypes = {
    setInit: PropTypes.func.isRequired,
    init: PropTypes.any,
    setProc: PropTypes.func.isRequired,
  };

  const initailForm = {
    name: '',
    val: '',
    type: '',
    datemov: '',
    tag: '',
  };
  const [form, setForm] = useState(initailForm);

  useEffect(() => {
    setForm(initailForm);
  }, []);

  const handleReset = () => {
    setForm(initailForm);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleInsert = async (e) => {
    setProc(true);
    e.preventDefault();
    if (init) {
      e.target.reset();
      const response = await DataService.insert(form);
      response.err ? alert('Fail') : alert('Success');
      setInit(Date.now());
    } else {
      alert('Server idle');
      setInit(undefined);
    }
    setProc(false);
  };

  return (
    <div>
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
          <label htmlFor="val">Tag</label>
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
          <input type="submit" className=" btn-primarys"></input>
          <input className=" btn-primarys" type="reset" value="Reset" onClick={handleReset} />
        </div>
      </form>
    </div>
  );
}
