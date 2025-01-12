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

    const lightModeColors = {
      '--main-color': '#01579b',
      '--second-color': '#0572c6',
      '--tertiary-color': '#79b7e8',
      '--opposite-color': '#e53935',
      '--opposite-second-color': '#ff5722',
      '--warning': '#ffcc80',
      '--success': '#4caf50',
      '--background': '#e8f4fa',
      '--text': '#212121',
      '--text-alt': '#ffffff',
      '--soft-gray': '#b5cdda',
    };

    const darkModeColors = {
      '--main-color': '#023965',
      '--second-color': '#256cae',
      '--tertiary-color': '#304c6e',
      '--opposite-color': '#e53935',
      '--opposite-second-color': '#ff5722',
      '--warning': '#ffab40',
      '--success': '#66bb6a',
      '--background': '#121212',
      '--text': '#e0e0e0',
      '--text-alt': '#ffffff',
      '--soft-gray': '#363c42',
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
