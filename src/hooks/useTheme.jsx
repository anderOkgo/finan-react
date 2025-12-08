import { useEffect, useState } from 'react';

// Helper functions for localStorage
const getStoredTheme = () => {
  const stored = localStorage.getItem('themePreference');
  if (stored === null) return null;
  return stored === 'dark';
};

const setStoredTheme = (isDark) => {
  localStorage.setItem('themePreference', isDark ? 'dark' : 'light');
};

const removeStoredTheme = () => {
  localStorage.removeItem('themePreference');
};

const getSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

// Custom React hook for managing theme state
export const useTheme = () => {
  // Initialize: check localStorage first, then system preference
  const storedTheme = getStoredTheme();
  const systemTheme = getSystemTheme();
  const initialTheme = storedTheme ?? systemTheme;

  const [isDarkMode, setIsDarkMode] = useState(initialTheme);
  const [useSystemDefault, setUseSystemDefault] = useState(storedTheme === null);

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    // If not using system default, update stored preference
    if (!useSystemDefault) {
      setStoredTheme(newMode);
    }
  };

  // Function to save current theme as default
  const saveThemeAsDefault = () => {
    setStoredTheme(isDarkMode);
    setUseSystemDefault(false);
  };

  // Function to restore system default
  const restoreSystemDefault = () => {
    removeStoredTheme();
    setUseSystemDefault(true);
    const systemTheme = getSystemTheme();
    setIsDarkMode(systemTheme);
  };

  // Effect hook to monitor system preference changes (only if using system default)
  useEffect(() => {
    if (!useSystemDefault) {
      // If not using system default, stop listening to system changes
      return;
    }

    // When using system default, sync with current system preference
    const systemTheme = getSystemTheme();
    setIsDarkMode(systemTheme);

    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (event) => {
      setIsDarkMode(event.matches);
    };

    darkModeMediaQuery.addEventListener('change', handleChange);

    return () => {
      darkModeMediaQuery.removeEventListener('change', handleChange);
    };
  }, [useSystemDefault]);

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
    saveThemeAsDefault,
    restoreSystemDefault,
  };

  return themeValues;
};
