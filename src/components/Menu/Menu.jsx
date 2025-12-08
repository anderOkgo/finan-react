import React, { useEffect, useRef, useState } from 'react';
import './Menu.css';
import AuthService from '../../services/auth.service';
import Status from '../Status/Status';
import { useContext } from 'react';
import GlobalContext from '../../contexts/GlobalContext';

const Menu = () => {
  const { init, setInit, proc, toggleDarkMode, saveThemeAsDefault, restoreThemeDefault, boot, username, t } =
    useContext(GlobalContext);
  const [currentUser, setCurrentUser] = useState(undefined);

  // Update currentUser whenever username changes
  useEffect(() => {
    setCurrentUser(username);
  }, [username]);

  const handleStatusClick = () => {
    boot();
    toggleDarkMode();
  };

  const handleThemeDoubleClick = () => {
    // Verificar si hay una preferencia guardada
    const hasStoredPreference = localStorage.getItem('themePreference') !== null;

    if (hasStoredPreference) {
      // Si hay preferencia guardada, restaurar el default del sistema
      restoreThemeDefault();
    } else {
      // Si no hay preferencia guardada, guardar la actual como default
      saveThemeAsDefault();
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    setInit(Date.now());
    checkboxRef.current.checked = false;
    setCurrentUser(undefined);
  };

  const title = t('finanzTitle'); // Use translation for the title

  const menuItems = [
    { label: t('animecreamApp'), url: 'https://react.animecream.com/' },
    { label: t('animecream'), url: 'https://www.animecream.com/' },
    { label: t('cyfer'), url: 'https://cyfer.animecream.com/' },
    {
      label: t('userSession'),
      url: '#',
      child: [
        { isSessionNeeded: false, label: t('login'), url: '#' },
        { isSessionNeeded: true, label: t('logout'), url: '#', trigger: handleLogout },
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
        <span className="icon-activity" onClick={handleStatusClick} onDoubleClick={handleThemeDoubleClick}>
          <Status {...{ init, proc }} />
        </span>
        {title}
      </div>
    </nav>
  );
};

export default Menu;
