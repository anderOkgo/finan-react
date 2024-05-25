import PropTypes from 'prop-types';
import './Status.css';

function Status({ init, proc }) {
  return (
    <>
      {proc && <span className="status-box">&#9201;</span>}
      {init ? <span className="status-box">&#128293;</span> : <span className="status-box">&#10060;</span>}
    </>
  );
}

Status.propTypes = {
  init: PropTypes.any,
  proc: PropTypes.any,
};

export default Status;
