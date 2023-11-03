import React, { useState, useEffect, useRef } from 'react';
import AuthService from '../../services/auth.service';
import './Menu.css';
import Status from '../Status/Status';

// eslint-disable-next-line react/prop-types
const Menu = ({ init, proc }) => {
  const [currentUser, setCurrentUser] = useState(undefined);
  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const handleLogout = () => {
    AuthService.logout();
  };

  const menuItems = [
    { label: 'Cyfer', url: 'https://cyfer.animecream.com/' },
    { label: 'R-Animecream', url: 'https://react.animecream.com/' },
    { label: 'Animecream', url: 'https://www.animecream.com/' },
    { label: 'Nabu', url: 'https://nabu.animecream.com/' },
    {
      label: 'session',
      url: '#',
      child: [
        { isSessionNeeded: false, label: 'login', url: '/' },
        { isSessionNeeded: true, label: 'logout', url: '/', trigger: handleLogout },
      ],
    },
  ];

  const checkboxRef = useRef(null);
  const spanRef = useRef(null);
  useEffect(() => {
    const handleClick = (e) => {
      if (checkboxRef.current == e.target || spanRef.current == e.target) {
        checkboxRef.current.checked ? false : true;
      } else if (e.target.closest('.navbar') !== null) {
        checkboxRef.current.checked = true;
      } else {
        checkboxRef.current.checked = false;
      }

      console.log(e.target);
    };
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="logo insetshadow">
        Finanz
        <span className="icon-activity">
          <Status init={init} proc={proc} />
        </span>
      </div>
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
                          <li key={subMenu.label} className="nav-item">
                            <a href={subMenu.url} className="nav-link" onClick={subMenu.trigger}>
                              {subMenu.label}
                            </a>
                          </li>
                        ) : (
                          !subMenu.isSessionNeeded &&
                          !currentUser && (
                            <li key={subMenu.label} className="nav-item">
                              <a href={subMenu.url} className="nav-link" onClick={subMenu?.trigger}>
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
                <li key={menuItem.label} className="nav-item">
                  <a href={menuItem.url}>{menuItem.label}</a>
                </li>
              )}
            </React.Fragment>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Menu;
