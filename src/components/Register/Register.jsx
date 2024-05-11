import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import AuthService from '../../services/auth.service';
import '../Login/Login';

const Register = ({ setInit, init, setProc }) => {
  const form = useRef();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const onChangeFirstName = (e) => {
    setUsername(e.target.value?.replace(/\s/g, ''));
  };

  const onChangeEmail = (e) => {
    setEmail(e.target.value);
  };

  const onChangePassword = (e) => {
    setPassword(e.target.value);
  };

  const onChangeVerificationCode = (e) => {
    setVerificationCode(e.target.value);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (init && !isRegistering) {
      setIsRegistering(true);
      setProc(true);
      let resp = await AuthService.register(username, email, password, verificationCode);
      if (resp.error) {
        setInit(false);
        console.error('Registration error:', resp.message);
      } else {
        setInit(Date.now());
        console.log('Registration successful:', resp.message);
      }
      setProc(false);
      setIsRegistering(false);
    }
  };

  return (
    <div className="col-md-12">
      <div className="card card-container">
        <img src="./icon/icon-512x512.png" alt="profile-img" className="profile-img-card" />
        <form onSubmit={handleRegister} ref={form}>
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
              onChange={onChangeFirstName}
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="form-control"
              name="email"
              value={email}
              onChange={onChangeEmail}
              required
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
              required
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="verificationCode">
              Verification Code
            </label>
            <input
              id="verificationCode"
              type="text"
              className="form-control"
              name="verificationCode"
              value={verificationCode}
              onChange={onChangeVerificationCode}
            />
          </div>

          <div className="form-group">
            <button className="btn-primary btn-block" disabled={isRegistering}>
              <span>{isRegistering ? 'Registering...' : 'Register'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

Register.propTypes = {
  setInit: PropTypes.func.isRequired,
  init: PropTypes.any.isRequired,
  setProc: PropTypes.func.isRequired,
  proc: PropTypes.any.isRequired,
};

export default Register;
