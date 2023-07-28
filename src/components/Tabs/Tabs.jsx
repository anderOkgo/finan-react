import CountDownEnd from '../countDownEnd/CountDownEnd';
import './Tabs.css';

export default function CardRow() {
  return (
    <div className="tabs-area">
      <input className="radio-tab" name="tab" type="radio" id="tab-one" defaultChecked="checked" />
      <label className="label-tab" htmlFor="tab-one">
        Tab1
      </label>
      <div className="panel-tab">
        <div className="section-tab">
          <h2>Remaining time</h2>
          <hr />
          <CountDownEnd />
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
