import { useState, useEffect } from 'react';

const translations = {
  en: {
    inputTab: 'Input',
    generalTab: 'General',
    tagTab: 'Tag',
    balanceTab: 'Balance',
    infoTab: 'Information',
    switchToSpanish: 'ENG',
    switchToEnglish: 'ESP',
    name: 'Name',
    value: 'Value',
    type: 'Type',
    from: 'From',
    date: 'Date',
    tag: 'Tag',
    reset: 'Reset',
    submit: 'Submit',
    delete: 'Delete',
    offlineTable: 'Offline Table',
    dailyExpenses: 'Daily Expenses',
    movementInput: 'Movement Input',
    queue: 'Queue',
    selectCurrency: 'Select Currency',
    animecreamApp: 'Animecream App',
    animecream: 'Animecream',
    cyfer: 'Cyfer',
    userSession: 'User Session',
    login: 'Login',
    logout: 'Logout',
    finanzTitle: 'Finanz',
    movementTable: 'Movement Table',
    source: 'Source',
    id: 'Id',
    log: 'Log',
    rows: 'Rows',
    searchPlaceholder: 'Search...',
    prev: 'Prev',
    next: 'Next',
    showing: 'Showing',
    of: 'of',
    records: 'records',
    tagTable: 'Tag Table',
    year: 'Year',
    hashtag: '#',
    month: 'Month',
    totalBalance: 'Total Balance',
    annualBalanceTable: 'Annual Balance Table',
    monthlyBalanceTable: 'Monthly Balance Table',
    dailyBalanceTable: 'Daily Balance Table',
    incomes: 'Incomes',
    expenses: 'Expenses',
    income: 'income',
    expense: 'expense',
    totalSave: 'Total Saved',
    balance: 'balance',
    Balance: 'Balance',
    allYears: 'All Years',
    total: 'Total',
    totalSaveAU: 'Total Save AU',
    totalExchangeCol: 'Total Exchange Col',
    tripsTable: 'Trips Table',
    typeTrip: 'Type Trip',
    totalFinalTrip: 'Total Final Trip',
    remainingTimeTable: 'Remaining Time Table',
    elapsed: 'Elapsed',
    remaining: 'Remaining',
    username: 'Username',
    password: 'Password',
    usernameForRegistration: 'Username for Registration',
    email: 'Email',
    verificationCode: 'Verification Code',
    registering: 'Registering...',
    register: 'Register',
    noEmoji: 'No Emojis Allowed',
    January: 'January',
    February: 'February',
    March: 'March',
    April: 'April',
    May: 'May',
    June: 'June',
    July: 'July',
    August: 'August',
    September: 'September',
    October: 'October',
    November: 'November',
    December: 'December',
  },
  es: {
    inputTab: 'Entrada',
    generalTab: 'General',
    tagTab: 'Etiqueta',
    balanceTab: 'Balance',
    infoTab: 'Información',
    switchToSpanish: 'ENG',
    switchToEnglish: 'ESP',
    name: 'Nombre',
    value: 'Valor',
    type: 'Tipo',
    from: 'De',
    date: 'Fecha',
    tag: 'Etiqueta',
    reset: 'Restablecer',
    submit: 'Enviar',
    delete: 'Eliminar',
    offlineTable: 'Tabla Offline',
    dailyExpenses: 'Gastos Diarios',
    movementInput: 'Ingreso de Movimiento',
    queue: 'Cola',
    selectCurrency: 'Seleccionar Moneda',
    animecreamApp: 'Animecream App',
    animecream: 'Animecream',
    cyfer: 'Cyfer',
    userSession: 'Usuario',
    login: 'Iniciar sesión',
    logout: 'Salir',
    finanzTitle: 'Finanz',
    movementTable: 'Tabla de Movimientos',
    source: 'Fuente',
    id: 'ID',
    log: 'Registro',
    rows: 'Filas',
    searchPlaceholder: 'Buscar...',
    prev: 'Anterior',
    next: 'Siguiente',
    showing: 'Mostrando',
    of: 'de',
    records: 'registros',
    tagTable: 'Tabla de Etiquetas',
    year: 'Año',
    hashtag: '#',
    month: 'Mes',
    totalBalance: 'Balance Total',
    annualBalanceTable: 'Tabla de Balance Anual',
    monthlyBalanceTable: 'Tabla de Balance Mensual',
    dailyBalanceTable: 'Tabla de Balance Diario',
    incomes: 'Ingresos',
    expenses: 'Gastos',
    income: 'ingreso',
    expense: 'gasto',
    totalSave: 'Total Ahorrado',
    balance: 'balance',
    Balance: 'Balance',
    allYears: 'Todos los Años',
    total: 'Total',
    totalSaveAU: 'Total Ahorrado AU',
    totalExchangeCol: 'Total Col de Cambio',
    tripsTable: 'Tabla de Viajes',
    typeTrip: 'Tipo de Viaje',
    totalFinalTrip: 'Total del Viaje Final',
    remainingTimeTable: 'Tabla de Cuenta Regresiva',
    elapsed: 'Transcurrido',
    remaining: 'Restante',
    username: 'Usuario',
    password: 'Contraseña',
    usernameForRegistration: 'Nombre de usuario para registro',
    email: 'Correo electrónico',
    verificationCode: 'Código de verificación',
    registering: 'Registrando...',
    register: 'Registrar',
    noEmoji: 'Emojis No Permitidos',
    January: 'Enero',
    February: 'Febrero',
    March: 'Marzo',
    April: 'Abril',
    May: 'Mayo',
    June: 'Junio',
    July: 'Julio',
    August: 'Agosto',
    September: 'Septiembre',
    October: 'Octubre',
    November: 'Noviembre',
    December: 'Diciembre',
  },
};

// Helper Functions
const getBrowserLanguage = () => {
  const browserLang = navigator.language.split('-')[0];
  return browserLang === 'es' ? 'es' : 'en';
};

const getStoredLanguage = () => {
  return localStorage.getItem('lang') || getBrowserLanguage();
};

// eslint-disable-next-line no-unused-vars
const setStoredLanguage = (lang) => {
  localStorage.setItem('lang', lang);
};

// Function to handle document updates
const setLanguage = (language) => {
  document.documentElement.lang = language;
  const metaDescription = document.querySelector('meta[name="description"]');
  if (language === 'es') {
    metaDescription.content =
      'Finanz es tu herramienta personal ideal para la planificación financiera: rastrea gastos, establece presupuestos y logra tus metas financieras fácilmente.';
    document.title = 'Finanz - Simplifica tu viaje financiero';
  } else {
    metaDescription.content =
      'Finanz is your go-to personal financial planning tool to track expenses, set budgets, and achieve your financial goals with ease.';
    document.title = 'Finanz - Simplify Your Financial Journey';
  }

  // Optionally log the change for debugging
  console.log(`Language set to: ${language}`);
};

// Custom Hook
export const useLanguage = () => {
  const [language, setLanguageState] = useState(getStoredLanguage());

  // Update language state and document configurations
  const updateLanguage = (lang) => {
    //setStoredLanguage(lang);
    setLanguageState(lang);
    setLanguage(lang);
  };

  // Toggle language
  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'es' : 'en';
    updateLanguage(newLang);
  };

  // Translate a given key
  const t = (key) => translations[language][key] || key;

  // Apply language on mount
  useEffect(() => {
    setLanguage(language);
  }, [language]);

  return {
    language,
    toggleLanguage,
    t,
  };
};
