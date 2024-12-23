import React, { useEffect, useRef, useState } from 'react';
import './Menu.css';
import AuthService from '../../services/auth.service';
import Status from '../Status/Status';
import { useContext } from 'react';
import GlobalContext from '../../contexts/GlobalContext';

const Menu = () => {
  const { init, setInit, proc, toggleDarkMode, boot, username } = useContext(GlobalContext);
  const [currentUser, setCurrentUser] = useState(undefined);

  // Update currentUser whenever username changes
  useEffect(() => {
    setCurrentUser(username);
  }, [username]);

  const handleStatusClick = () => {
    boot();
    toggleDarkMode();
  };

  const handleLogout = () => {
    AuthService.logout();
    setInit(Date.now());
    checkboxRef.current.checked = false;
    setCurrentUser(undefined);
  };

  const title = 'Finanz';

  const menuItems = [
    { label: 'Animecream App', url: 'https://react.animecream.com/' },
    { label: 'Animecream', url: 'https://www.animecream.com/' },
    { label: 'Cyfer', url: 'https://cyfer.animecream.com/' },
    {
      label: 'User Session',
      url: '#',
      child: [
        { isSessionNeeded: false, label: 'login', url: '#' },
        { isSessionNeeded: true, label: 'logout', url: '#', trigger: handleLogout },
      ],
    },
  ];

  const checkboxRef = useRef(null);
  const spanRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (checkboxRef.current === e.target || spanRef.current === e.target) {
        checkboxRef.current.checked = !checkboxRef.current.checked;
      } else if (e.target.closest('.navbar') !== null) {
        // Do nothing if clicked inside the navbar
      } else {
        checkboxRef.current.checked = false;
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [init]);

  return (
    <nav className="navbar">
      <div className="nav-links">
        <input type="checkbox" id="checkbox_toggle" ref={checkboxRef} />
        <label htmlFor="checkbox_toggle" className="hamburger">
          <span ref={spanRef} className="hamb-line"></span>
        </label>
        <ul className="menu">
          {menuItems.map((menuItem, index) => (
            <React.Fragment key={index}>
              {menuItem.child ? (
                <>
                  <li key={menuItem.label} className="services">
                    <a href={menuItem.url}>{menuItem.label}</a>
                    <ul className="dropdown">
                      {menuItem.child.map((subMenu) =>
                        subMenu.isSessionNeeded === true && currentUser ? (
                          <li key={subMenu.label}>
                            <a href={subMenu.url} onClick={subMenu.trigger}>
                              {subMenu.label}
                            </a>
                          </li>
                        ) : (
                          !subMenu.isSessionNeeded &&
                          !currentUser && (
                            <li key={subMenu.label}>
                              <a href={subMenu.url} onClick={subMenu?.trigger}>
                                {subMenu.label}
                              </a>
                            </li>
                          )
                        )
                      )}
                    </ul>
                  </li>
                </>
              ) : (
                <li key={menuItem.label}>
                  <a href={menuItem.url}>{menuItem.label}</a>
                </li>
              )}
            </React.Fragment>
          ))}
        </ul>
      </div>
      <div className="logo insetshadow">
        <span className="icon-activity" onClick={handleStatusClick}>
          <Status {...{ init, proc }} />
        </span>
        {title}
      </div>
    </nav>
  );
};

export default Menu;
