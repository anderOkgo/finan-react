import PropTypes from 'prop-types';
import CountDownEnd from '../CountDownEnd/CountDownEnd';
import Form from '../Form/Form';
import Bank from '../Bank/Bank';
import Table from '../Table/Table';
import './Tabs.css';

export default function Tabs({ setInit, init, setProc, proc }) {
  Tabs.propTypes = {
    setInit: PropTypes.func.isRequired,
    init: PropTypes.any,
    setProc: PropTypes.func.isRequired,
    proc: PropTypes.any,
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
            <Bank setInit={setInit} init={init} setProc={setProc} proc={proc} />
            <br />
            <Form setInit={setInit} init={init} setProc={setProc} proc={proc} />
          </div>
        </div>
      </div>

      <input className="radio-tab" name="tab" type="radio" id="tab-two" />
      <label className="label-tab" htmlFor="tab-two">
        Balance
      </label>
      <div className="panel-tab">
        <div className="section-tab">
          <div className="container">
            <h2>Title2</h2>
            <Table />
          </div>
        </div>
      </div>

      <input className="radio-tab" name="tab" type="radio" id="tab-three" />
      <label className="label-tab" htmlFor="tab-three">
        Tab3
      </label>
      <div className="panel-tab">
        <div className="section-tab">
          <div className="container">
            <h2>Title3</h2>
            <p>
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quasi deleniti laudantium suscipit ipsam,
              aliquid, rerum assumenda esse hic ducimus temporibus accusantium nesciunt quidem dolor ea delectus
              deserunt sit! Repudiandae, quasi?
            </p>
          </div>
        </div>
      </div>

      <input className="radio-tab" name="tab" type="radio" id="tab-four" />
      <label className="label-tab" htmlFor="tab-four">
        Tab4
      </label>
      <div className="panel-tab">
        <div className="section-tab">
          <div className="container">
            <h2>Title4</h2>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis consequuntur unde rem assumenda
              distinctio labore impedit tenetur natus eos voluptatem quaerat vero veritatis dicta temporibus
              maxime, error, soluta molestias perferendis?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
