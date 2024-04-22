import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';

import './Navigation.css';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);

  return (
    <ul>
      <li>
        <NavLink to="/">
          <div className="image-container">
            <img className='large-screen' src='../../../img/fire3.png' alt='Home' />
            <img className='small-screen' src='../../../img/fire3.png' alt='Home' />
            <span className="large-screen-text">FireBnB</span>
          </div>
        </NavLink>
      </li>
      <div className='create-new-spot'>
        {sessionUser === null ? (
          <img />
        ) : (
          <NavLink to="/create-spot">Create a New Spot</NavLink>
        )}
      </div>
      {isLoaded && (
        <li>
          <ProfileButton user={sessionUser} />
        </li>
      )}
    </ul>
  );
}

export default Navigation;
