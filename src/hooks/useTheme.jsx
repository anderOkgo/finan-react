import { useEffect, useState } from 'react';

// Custom React hook for managing theme state
export const useTheme = () => {
  // State to manage dark mode, initialized based on system preference
  const [isDarkMode, setIsDarkMode] = useState(window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Effect hook to monitor system preference changes
  useEffect(() => {
    // Match media query for dark mode
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Handler function to update dark mode state
    const handleChange = (event) => {
      setIsDarkMode(event.matches);
    };

    // Initialize dark mode state and add event listener for changes
    handleChange(darkModeMediaQuery);
    darkModeMediaQuery.addEventListener('change', handleChange);

    // Cleanup function to remove event listener when component unmounts
    return () => {
      darkModeMediaQuery.removeEventListener('change', handleChange);
    };
  }, []); // Empty dependency array ensures effect runs only once on component mount

  // Effect hook to apply theme styles
  useEffect(() => {
    const root = document.documentElement;

    // Define colors for light and dark modes
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

    // Apply color variables as CSS custom properties to root element
    for (const [key, value] of Object.entries(colors)) {
      root.style.setProperty(key, value);
    }

    // Update theme color meta tag
    document.querySelector('meta[name="theme-color"]').setAttribute('content', colors['--main-color']);
  }, [isDarkMode]);

  const themeValues = {
    isDarkMode,
    toggleDarkMode,
  };

  return themeValues;
};
