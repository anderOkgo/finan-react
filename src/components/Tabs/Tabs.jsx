import CountDownEnd from '../countDownEnd/CountDownEnd';
import { useEffect, useState } from 'react';
import DataService from '../../services/data.service';
import './Tabs.css';
import { moneyFormat } from '../../helpers/operations';
import { useAlive } from '../../hooks/useAlive';

export default function CardRow() {
  const initailForm = {
    name: '',
    val: '',
    type: '',
    datemov: '',
    tag: '',
  };

  const [form, setForm] = useState(initailForm);
  const { setInit, init, setProc, proc } = useAlive();
  const [bankTotal, setBankTotal] = useState(0);

  useEffect(() => {
    setForm(initailForm);
  }, []);

  const handleReset = () => {
    setForm(initailForm);
  };

  useEffect(() => {
    const fetchData = async () => {
      setProc(true);
      if (init) {
        let resp = await DataService.totalBank();
        resp.err ? setInit(false) : setBankTotal(resp[0] === undefined ? 0 : resp[0].total_bank) & setInit(true);
      }
      setProc(false);
    };

    fetchData();
  }, [init]);

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
    <div className="tabs-area">
      <input className="radio-tab" name="tab" type="radio" id="tab-one" defaultChecked="checked" />
      <label className="label-tab" htmlFor="tab-one">
        Input
      </label>
      <div className="panel-tab">
        <div className="section-tab">
          <div className="container">
            <h2>Remaining time</h2>
            <hr />
            <CountDownEnd />
            <br />
            <div className="label-bank">
              {proc && <p> &#9201;</p>}
              {init ? <p> &#128293;</p> : <p> &#10060;</p>} ToataBank: {moneyFormat(bankTotal)}
            </div>
            {/* {bankTotal.map((genre) => (
              <span className="tag" key={genre}>
                {genre}
              </span>
            ))} */}
            <br />
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
          </div>
        </div>
      </div>

      <input className="radio-tab" name="tab" type="radio" id="tab-two" />
      <label className="label-tab" htmlFor="tab-two">
        Tab2
      </label>
      <div className="panel-tab">
        <div className="section-tab">
          <h2>Title2</h2>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit quod laborum voluptates eaque nemo atque
            necessitatibus laudantium ex error nisi esse facere, placeat nesciunt veritatis recusandae aliquam
            itaque. Nesciunt, voluptatum!
          </p>
        </div>
      </div>

      <input className="radio-tab" name="tab" type="radio" id="tab-three" />
      <label className="label-tab" htmlFor="tab-three">
        Tab3
      </label>
      <div className="panel-tab">
        <div className="section-tab">
          <h2>Title3</h2>
          <p>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quasi deleniti laudantium suscipit ipsam,
            aliquid, rerum assumenda esse hic ducimus temporibus accusantium nesciunt quidem dolor ea delectus
            deserunt sit! Repudiandae, quasi?
          </p>
        </div>
      </div>
      <input className="radio-tab" name="tab" type="radio" id="tab-four" />
      <label className="label-tab" htmlFor="tab-four">
        Tab4
      </label>
      <div className="panel-tab">
        <div className="section-tab">
          <h2>Title4</h2>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis consequuntur unde rem assumenda
            distinctio labore impedit tenetur natus eos voluptatem quaerat vero veritatis dicta temporibus maxime,
            error, soluta molestias perferendis?
          </p>
        </div>
      </div>
    </div>
  );
}
