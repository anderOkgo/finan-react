import { useState, useRef } from 'react';
import AuthService from '../../../services/auth.service';
import '../Login/Login';
import { useContext } from 'react';
import GlobalContext from '../../../contexts/GlobalContext';

const Register = () => {
  const { setInit, init, setProc } = useContext(GlobalContext);
  const form = useRef();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const onChangeUsername = (e) => {
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
      if (resp.err) {
        alert(resp.err.response);
        setInit(false);
        console.error('Registration error:', resp.err.response);
      } else {
        alert(resp);
        setInit(Date.now());
        console.log('Registration successful:', resp);
      }
      setProc(false);
      setIsRegistering(false);
    }
  };

  return (
    <div className="col-md-12">
      <div className="card card-container">
        <img src="./icon/ico-512x512.png" alt="profile-img" className="profile-img-card" />
        <form onSubmit={handleRegister} ref={form}>
          <div className="form-group">
            <label className="label" htmlFor="register-username">
              Username for Registration
            </label>
            <input
              id="register-username"
              type="text"
              className="form-control"
              name="username"
              value={username}
              onChange={onChangeUsername}
              autoComplete="off"
              required
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="register-email">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              className="form-control"
              name="email"
              value={email}
              onChange={onChangeEmail}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="register-password">
              Password
            </label>
            <input
              id="register-password"
              type="password"
              className="form-control"
              name="password"
              value={password}
              onChange={onChangePassword}
              autoComplete="off"
              required
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="register-verificationCode">
              Verification Code
            </label>
            <input
              id="register-verificationCode"
              type="text"
              className="form-control"
              name="verificationCode"
              value={verificationCode}
              onChange={onChangeVerificationCode}
              autoComplete="off"
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

export default Register;
