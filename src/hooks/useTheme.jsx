import { useEffect, useState } from 'react';

export const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event) => {
      setIsDarkMode(event.matches);
    };

    handleChange(darkModeMediaQuery);

    darkModeMediaQuery.addEventListener('change', handleChange);

    return () => {
      darkModeMediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const lightModeColors = {
      '--main-color': '#01579b',
      '--second-color': '#086bb8',
      '--tertiary-color': '#d4f1f7',
      '--opposite-color': '#f44336',
      '--opposite-second-color': '#ff3c0b',
      '--warning': 'navajowhite',
      '--success': 'green',
      '--background': '#fff',
      '--text': '#000',
      '--text-alt': '#fff',
      '--soft-gray': '#ddd',
    };

    const darkModeColors = {
      '--main-color': '#023965',
      '--second-color': '#367bb9',
      '--tertiary-color': '#516a89',
      '--opposite-color': '#f44336',
      '--opposite-second-color': '#ff3c0b',
      '--warning': '#6d4a03',
      '--success': 'darkgreen',
      '--background': '#121212',
      '--text': '#fff',
      '--text-alt': '#fff',
      '--soft-gray': '#333',
    };

    const colors = isDarkMode ? darkModeColors : lightModeColors;

    for (const [key, value] of Object.entries(colors)) {
      root.style.setProperty(key, value);
    }
    document.querySelector('meta[name="theme-color"]').setAttribute('content', colors['--main-color']);
  }, [isDarkMode]);

  const themeValues = {
    isDarkMode,
    toggleDarkMode,
  };

  return themeValues;
};
