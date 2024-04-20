import { useState } from 'react';
import * as sessionActions from '../../store/session';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import './LoginForm.css';

function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [demoCredential] = useState('Demo-lition');
  const [demoPassword] = useState('password');
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const activateButton = (credential.length < 4 || password.length < 6);

  const handleSubmit = (e) => {
    if(!activateButton) {
      console.log("BUTTON CLICK: " + activateButton);
      e.preventDefault();
      setErrors({});
      return dispatch(sessionActions.login({ credential, password }))
        .then(closeModal)
        .catch(async (res) => {
          const data = await res.json();
          if (data && data.errors) {
            setErrors(data.errors);
          }
        });
    }
  };

  const handleDemoUser = async () => {
      dispatch(sessionActions.login({ credential: demoCredential, password: demoPassword }));
      closeModal();
  };

  return (
    <>
      <div className='container'>
        <div className='header'>
          <div className='text'>Log In</div>
          <div className='underline'></div>
        </div>
        <div className='inputs'>
        <div className='input'>
          <input
           type="text"
           placeholder='Username or Email'
           value={credential}
           onChange={(e) => setCredential(e.target.value)}
           required
          />
        </div>
        <div className='input'>
        <input
          type="password"
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        </div>
        </div>
        {errors.credential && (
        <p className='error-message'>{errors.credential}</p>
        )}
        <div className='submit-container'>
          <div className={activateButton?'submit gray':'submit'} onClick={handleSubmit}>Log In</div>
        </div>
        <div className='demo-user'>Log in as Demo User? <span onClick={handleDemoUser}>Click Here!</span></div>
      </div>
    </>
  );
}

export default LoginFormModal;
