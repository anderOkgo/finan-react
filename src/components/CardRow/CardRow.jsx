//import * as React from 'react';
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
              <h2>{`titulo`}</h2>
              <p>
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus voluptates dignissimos facere, nisi,
                molestiae ex ipsa laboriosam dicta saepe similique, a non quam harum ipsum reprehenderit aliquid
                molestias impedit illo.
              </p>
            </div>
          </div>
        </div>
        <input className="radiotab" name={`tab-${1}`} type="radio" id={`tabtwo-${1}`} />
        <label className="label tab-desc" htmlFor={`tabtwo-${1}`}>
          Tab2
        </label>
        <div className="panel">
          <div id="section2" className="tab-section">
            <h2>{'Ander'}</h2>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel consequatur exercitationem obcaecati
              ducimus dolorum velit sapiente blanditiis provident quas. Voluptatem reiciendis quae aliquam libero
              tempora ratione enim debitis consectetur soluta.
            </p>
          </div>
        </div>
        <input className="radiotab" name={`tab-${1}`} type="radio" id={`tabthree-${1}`} />
        <label className="label tab-desc" htmlFor={`tabthree-${1}`}>
          Tab3
        </label>
        <div className="panel">
          <div id="section2" className="tab-section">
            <h2>{'title3'}</h2>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel consequatur exercitationem obcaecati
              ducimus dolorum velit sapiente blanditiis provident quas. Voluptatem reiciendis quae aliquam libero
              tempora ratione enim debitis consectetur soluta.
            </p>
          </div>
        </div>
        <input className="radiotab" name={`tab-${1}`} type="radio" id={`tabfour-${1}`} />
        <label className="label tab-desc" htmlFor={`tabfour-${1}`}>
          Tab4
        </label>
        <div className="panel">
          <div id="section2" className="tab-section">
            <h2>{'title4'}</h2>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel consequatur exercitationem obcaecati
              ducimus dolorum velit sapiente blanditiis provident quas. Voluptatem reiciendis quae aliquam libero
              tempora ratione enim debitis consectetur soluta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
