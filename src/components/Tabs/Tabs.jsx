import CountDownEnd from '../countDownEnd/CountDownEnd';
import { useEffect, useState } from 'react';
import DataService from '../../services/data.service';
import './Tabs.css';
import { moneyFormat } from '../../helpers/operations';

export default function CardRow() {
  const [bankTotal, setBankTotal] = useState({});
  const [form, setForm] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      let resp = await DataService.totalBank();
      setBankTotal(resp[0]);
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleInsert = async (e) => {
    e.preventDefault();
    let resp = await DataService.insert(form);
    //console.log(resp);
    e.target.reset();
    setForm(0);
    if (resp) {
      window.location.reload();
    }
  };

  return (
    <div className="tabs-area">
      <input className="radio-tab" name="tab" type="radio" id="tab-one" defaultChecked="checked" />
      <label className="label-tab" htmlFor="tab-one">
        Tab1
      </label>
      <div className="panel-tab">
        <div className="section-tab">
          <div className="container">
            <h2>Remaining time</h2>
            <hr />
            <CountDownEnd />
            <br />
            <div className="label-bank">ToataBank: {moneyFormat(bankTotal.total_bank)}</div>
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
                  <select className="form-control" name="type" onChange={handleChange} required>
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
                  <button className="btn btn-primary btn-block">
                    <span>Send</span>
                  </button>
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
