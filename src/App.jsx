import { useState, useEffect } from 'react';
import './App.css';
import Home from './components/Home/Home';
import Menu from './components/Menu/Menu';
import { useAlive } from '../src/hooks/useAlive';

const App = () => {
  const { init, setInit, proc, setProc } = useAlive();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Function to toggle between light and dark modes
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Set up effect to update colors when dark mode is toggled
  useEffect(() => {
    const root = document.documentElement;

    // Define colors for light mode
    const lightModeColors = {
      '--main-color': '#01579b',
      '--second-color': '#086bb8',
      '--tertiary-color': '#d4f1f7',
      '--opposite-color': '#f44336',
      '--opposite-dark-color': '#ff3c0b',
      '--warning': 'navajowhite',
      '--background': '#fff',
      '--black': '#000',
      '--dark-gray': '#333',
      '--light-gray': '#e4e9ee',
      '--soft-gray': '#ccc',
    };

    // Define colors for dark mode
    const darkModeColors = {
      '--main-color': '#333333', // Deep charcoal
      '--second-color': '#287098', // Deep navy
      '--tertiary-color': '#516a89', // Almost black for background elements
      '--opposite-color': '#f44336', // Keep red for accents
      '--opposite-dark-color': '#ff3c0b', // Keep dark red for accents
      '--warning': '#c3814c', // Orange instead of navajowhite for warnings
      '--background': '#dcdcdc', // Light gray instead of white
      '--black': '#000',
      '--dark-gray': '#555', // Change dark gray to a slightly lighter tone
      '--light-gray': '#ccc', // Keep light gray for borders and subtle details
      '--soft-gray': '#333', // Darker soft gray for subtle highlights
    };

    // Apply the appropriate set of colors based on the dark mode state
    const colors = isDarkMode ? darkModeColors : lightModeColors;

    // Update the CSS variables on the root element
    for (const [key, value] of Object.entries(colors)) {
      root.style.setProperty(key, value);
    }
  }, [isDarkMode]);

  return (
    <div className="app">
      <Menu {...{ init, proc, toggleDarkMode }} />
      <Home {...{ setInit, init, setProc, proc }} />
    </div>
  );
};

export default App;
