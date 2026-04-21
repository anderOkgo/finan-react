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
      '--brand-primary': '#01579b',
      '--brand-secondary': '#0572c6',
      '--brand-accent': '#79b7e8',
      '--color-danger': '#e53935',
      '--color-danger-alt': '#ff5722',
      '--color-warning': '#ffcc80',
      '--color-success': '#4caf50',
      '--bg-surface': '#e8f4fa',
      '--text-body': '#212121',
      '--text-invert': '#ffffff',
      '--border-subtle': '#b5cdda',
      '--shadow-sm': 'rgba(0, 0, 0, 0.1)',
      '--shadow-md': 'rgba(0, 0, 0, 0.15)',
      '--focus-ring': 'rgba(5, 114, 198, 0.1)',
      '--white': '#ffffff',
      '--black': '#000000',
      '--input-bg-surface': '#ffffff',
    };

    const darkModeColors = {
      '--brand-primary': '#023965',
      '--brand-secondary': '#256cae',
      '--brand-accent': '#304c6e',
      '--color-danger': '#e53935',
      '--color-danger-alt': '#ff5722',
      '--color-warning': '#ffab40',
      '--color-success': '#66bb6a',
      '--bg-surface': '#121212',
      '--text-body': '#e0e0e0',
      '--text-invert': '#ffffff',
      '--border-subtle': '#363c42',
      '--shadow-sm': 'rgba(0, 0, 0, 0.3)',
      '--shadow-md': 'rgba(0, 0, 0, 0.4)',
      '--focus-ring': 'rgba(37, 108, 174, 0.2)',
      '--white': '#ffffff',
      '--black': '#000000',
      '--input-bg-surface': '#1e1e1e',
    };

    const colors = isDarkMode ? darkModeColors : lightModeColors;

    // Apply color variables as CSS custom properties to root element
    for (const [key, value] of Object.entries(colors)) {
      root.style.setProperty(key, value);
    }

    // Update theme color meta tag
    document.querySelector('meta[name="theme-color"]').setAttribute('content', colors['--brand-primary']);
  }, [isDarkMode]);

  const themeValues = {
    isDarkMode,
    toggleDarkMode,
    saveThemeAsDefault,
    restoreSystemDefault,
  };

  return themeValues;
};

