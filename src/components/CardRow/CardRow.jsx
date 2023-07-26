//import * as React from 'react';
//import ExchangeRate from '../ExchangeRate';
import CountDownEnd from '../countDownEnd/CountDownEnd';
import './CardRow.css';

export default function CardRow() {
  return (
    <div className="card">
      <div className="tabs">
        <input className="radiotab" name={`tab-${1}`} type="radio" id={`tabone-${1}`} defaultChecked="checked" />
        <label className="label" htmlFor={`tabone-${1}`}>
          Tab1
        </label>
        <div className="panel">
          <div className="tab-section">
            <div className="section-details">
              <h2>{`Remaing time`}</h2>
              <hr />
              <CountDownEnd />
              <div>{/* <ExchangeRate /> */}</div>
            </div>
          </div>
        </div>
        <input className="radiotab" name={`tab-${1}`} type="radio" id={`tabtwo-${1}`} />
        <label className="label tab-desc" htmlFor={`tabtwo-${1}`}>
          Tab2
        </label>
        <div className="panel">
          <div id="section2" className="tab-section">
            <h2>{'Title2'}</h2>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Sit quod laborum voluptates eaque nemo atque
              necessitatibus laudantium ex error nisi esse facere, placeat nesciunt veritatis recusandae aliquam
              itaque. Nesciunt, voluptatum!
            </p>
          </div>
        </div>
        <input className="radiotab" name={`tab-${1}`} type="radio" id={`tabthree-${1}`} />
        <label className="label tab-desc" htmlFor={`tabthree-${1}`}>
          Tab3
        </label>
        <div className="panel">
          <div id="section2" className="tab-section">
            <h2>{'Title3'}</h2>
            <p>
              Lorem ipsum dolor sit amet consectetur, adipisicing elit. Quasi deleniti laudantium suscipit ipsam,
              aliquid, rerum assumenda esse hic ducimus temporibus accusantium nesciunt quidem dolor ea delectus
              deserunt sit! Repudiandae, quasi?
            </p>
          </div>
        </div>
        <input className="radiotab" name={`tab-${1}`} type="radio" id={`tabfour-${1}`} />
        <label className="label tab-desc" htmlFor={`tabfour-${1}`}>
          Tab4
        </label>
        <div className="panel">
          <div id="section2" className="tab-section">
            <h2>{'Title4'}</h2>
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
