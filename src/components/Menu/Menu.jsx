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
        { session: true, label: 'login', url: '/' },
        { session: true, label: 'logout', url: '/', trigger: handleLogout },
      ],
    },
  ];

  const [isChecked, setIsChecked] = useState(false);
  const checkboxRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (checkboxRef.current && !checkboxRef.current.contains(e.target)) setIsChecked(false);
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
        <input
          type="checkbox"
          id="checkbox_toggle"
          checked={isChecked}
          ref={checkboxRef}
          onChange={(e) => setIsChecked(e.target.checked)}
        />
        <label htmlFor="checkbox_toggle" className="hamburger">
          <span className="hamb-line"></span>
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
                        subMenu.session === true && currentUser ? (
                          <li key={subMenu.label} className="nav-item">
                            <a href={subMenu.url} className="nav-link" onClick={subMenu.trigger}>
                              {subMenu.label}
                            </a>
                          </li>
                        ) : (
                          !subMenu.session && (
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
