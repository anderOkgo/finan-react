import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx';
import AppCrashFallback from './components/ErrorBoundary/AppCrashFallback.jsx';
import '@fontsource/roboto/latin.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary fallback={<AppCrashFallback />}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ErrorBoundary>
);
