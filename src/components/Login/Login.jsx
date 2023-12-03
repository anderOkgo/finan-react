import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import AuthService from '../../services/auth.service';
import './Login.css';
import Status from '../Status/Status';

const Login = ({ setInit, init, setProc, proc }) => {
  Login.propTypes = {
    setInit: PropTypes.func.isRequired,
    init: PropTypes.any,
    setProc: PropTypes.func.isRequired,
    proc: PropTypes.any,
  };

  const form = useRef();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const onChangeUsername = (e) => {
    const username = e.target.value;
    setUsername(username);
  };

  const onChangePassword = (e) => {
    const password = e.target.value;
    setPassword(password);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (init) {
      setProc(true);
      let resp = await AuthService.login(username, password);
      resp.err ? setInit(false) : window.location.reload() & setInit(true);
      setProc(false);
    }
  };

  return (
    <div className="col-md-12">
      <div className="card card-container">
        <img
          src="https://yt3.googleusercontent.com/iwymRBmnJnWYtYeRPq4Eq1vYOAZboixRqAQQgtM8uL0JAhDTkFUN_iZH9cfnKKEiahNoNiPxAw=s176-c-k-c0x00ffffff-no-rj"
          alt="profile-img"
          className="profile-img-card"
        />
        <form onSubmit={handleLogin} ref={form}>
          <div className="form-group">
            <label className="label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              type="text"
              className="form-control"
              name="username"
              value={username}
              onChange={onChangeUsername}
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-control"
              name="password"
              value={password}
              onChange={onChangePassword}
            />
          </div>

          <div className="form-group">
            <button className="btn btn-primary btn-block">
              <span>Login</span>
              <Status init={init} proc={proc} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
