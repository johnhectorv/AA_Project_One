import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { FaUserCircle } from 'react-icons/fa';
import * as sessionActions from '../../store/session';
import OpenModalMenuItem from './OpenModalMenuItem';
import LoginFormModal from '../LoginFormModal';
import SignupFormModal from '../SignupFormModal';
import './ProfileButton.css';

function ProfileButton({ user }) {
  const dispatch = useDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const ulRef = useRef();

  const toggleMenu = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      if (!ulRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('click', closeMenu);

    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const closeMenu = () => setShowMenu(false);

  const logout = (e) => {
    e.preventDefault();
    dispatch(sessionActions.logout());
    closeMenu();
    console.log('Log Out Clicked');
    window.location.href = '/';
  };

  const ulClassName = "profile-dropdown" + (showMenu ? "" : " hidden");

  return (
    <>
      <button className='profile-button' onClick={toggleMenu}>
        <div className='dash-container'>
          <div className='dash'></div>
          <div className='dashTwo'></div>
          <div className='dashThree'></div>
        </div>
        <FaUserCircle />
      </button>
      <ul className={ulClassName} ref={ulRef}>
        {user ? (
          <>
            <div className='menu-header'>
              <div className='username'>Hello, {user.firstName}</div>
              <div className='email'>{user.email}</div>
              <div className='menu-underline'></div>
            </div>
            <div className='menu-buttons'>
              <div className='manage-spots'>Manage Spots</div>
              <div className='logout' onClick={logout} to='/'>Log Out</div>
            </div>
          </>
        ) : (
          <>
          <div className='menu-buttons-start'>
            <OpenModalMenuItem
              itemText="Log in"
              onItemClick={closeMenu}
              modalComponent={<LoginFormModal />}
            />
            <div className='line'></div>
            <OpenModalMenuItem
              itemText="Sign up"
              onItemClick={closeMenu}
              modalComponent={<SignupFormModal />}
            />
          </div>
          </>
        )}
      </ul>
    </>
  );
}

export default ProfileButton;
