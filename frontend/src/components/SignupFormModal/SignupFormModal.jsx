import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from '../../context/Modal';
import * as sessionActions from '../../store/session';
import './SignupForm.css';

function SignupFormModal() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const activateButton =(
  email.length === 0 ||
  username.length < 4 ||
  firstName.length === 0 ||
  lastName.length === 0 ||
  password.length < 6 ||
  confirmPassword.length === 0);

  const passwordMatch = password === confirmPassword;



  const handleSubmit = (e) => {
    e.preventDefault();

    if (!activateButton) {
      setErrors({});
      if (!passwordMatch) {
        setErrors({
          confirmPassword: "Confirm Password field must be the same as the Password field"
        });
        return;
      }

      dispatch(
        sessionActions.signup({
          email,
          username,
          firstName,
          lastName,
          password
        })
      )
      .then(closeModal)
      .catch(async (res) => {
        const data = await res.json();
        if (data?.errors) {
          setErrors(data.errors);
        }
      });
    }
  };

  return (
    <>
      <div className='container'>
        <div className='header'>
          <div className='text'>Sign Up</div>
          <div className='underline'></div>
        </div>
        <form>
          <div className='inputs'>
            <div className='input'>
              <input
                type="text"
                placeholder='Email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {errors.email && <p className='error-message'>{errors.email}</p>}
            <div className='input'>
              <input
                type="text"
                placeholder='Username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            {errors.username && <p className='error-message'>{errors.username}</p>}
            <div className='input'>
              <input
                type="text"
                placeholder='First Name'
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            {errors.firstName && <p className='error-message'>{errors.firstName}</p>}
            <div className='input'>
              <input
                type="text"
                placeholder='Last Name'
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            {errors.lastName && <p className='error-message'>{errors.lastName}</p>}
            <div className='input'>
              <input
                type="password"
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {errors.password && <p className='error-message'>{errors.password}</p>}
            <div className='input'>
              <input
                type="password"
                placeholder='Confirm Password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {errors.confirmPassword && <p className='error-message'>{errors.confirmPassword}</p>}
          </div>
          <div className='submit-container'>
            <div className={activateButton ? 'submitone gray' : 'submitone'} onClick={handleSubmit}>Sign Up</div>
          </div>
        </form>
      </div>
    </>
  );
}

export default SignupFormModal;
