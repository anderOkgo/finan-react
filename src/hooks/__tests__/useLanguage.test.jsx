import { renderHook, act } from '@testing-library/react';
import { useLanguage, translateApiMessage, translateAuthMessage, translations } from '../useLanguage.jsx';

describe('translations', () => {
  // t() shows the message itself when a key is missing in the current language: that is only the
  // same as falling back to English while both languages have the same keys, none of them empty.
  it('has the same keys in English and Spanish, and no empty text', () => {
    expect(Object.keys(translations.es).sort()).toEqual(Object.keys(translations.en).sort());
    Object.values(translations.en).forEach((text) => expect(text).toBeTruthy());
    Object.values(translations.es).forEach((text) => expect(text).toBeTruthy());
  });
});

const setBrowserLanguage = (lang) => {
  Object.defineProperty(window.navigator, 'language', { value: lang, configurable: true });
};

describe('useLanguage', () => {
  beforeEach(() => {
    localStorage.clear();
    setBrowserLanguage('en-US');
    document.head.innerHTML = '<meta name="description" content="">';
  });

  it('follows the browser language when nothing is stored', () => {
    setBrowserLanguage('es-CO');
    const { result } = renderHook(() => useLanguage());
    expect(result.current.language).toBe('es');
    expect(document.documentElement.lang).toBe('es');
    expect(document.title).toBe('Finanz - Simplifica tu viaje financiero');
    expect(document.querySelector('meta[name="description"]').content).toMatch(/^Finanz es/);
  });

  it('treats any browser language other than Spanish as English', () => {
    setBrowserLanguage('fr-FR');
    const { result } = renderHook(() => useLanguage());
    expect(result.current.language).toBe('en');
    expect(document.title).toBe('Finanz - Simplify Your Financial Journey');
  });

  it('starts from the stored language', () => {
    localStorage.setItem('lang', 'es');
    const { result } = renderHook(() => useLanguage());
    expect(result.current.language).toBe('es');
  });

  it('toggles without saving while it follows the system', () => {
    const { result } = renderHook(() => useLanguage());
    act(() => result.current.toggleLanguage());
    expect(result.current.language).toBe('es');
    expect(localStorage.getItem('lang')).toBeNull();
  });

  it('toggles and saves once a default is stored', () => {
    localStorage.setItem('lang', 'es');
    const { result } = renderHook(() => useLanguage());
    act(() => result.current.toggleLanguage());
    expect(result.current.language).toBe('en');
    expect(localStorage.getItem('lang')).toBe('en');
  });

  it('saves the current language as the default', () => {
    const { result } = renderHook(() => useLanguage());
    act(() => result.current.toggleLanguage());
    act(() => result.current.saveLanguageAsDefault());
    expect(localStorage.getItem('lang')).toBe('es');
    expect(result.current.language).toBe('es');
  });

  it('restores the system default', () => {
    localStorage.setItem('lang', 'es');
    const { result } = renderHook(() => useLanguage());
    act(() => result.current.restoreSystemDefault());
    expect(localStorage.getItem('lang')).toBeNull();
    expect(result.current.language).toBe('en');
  });

  it('follows a language stored by another tab', () => {
    const { result } = renderHook(() => useLanguage());
    act(() => {
      localStorage.setItem('lang', 'es');
      window.dispatchEvent(new StorageEvent('storage', { key: 'lang', newValue: 'es' }));
    });
    expect(result.current.language).toBe('es');
  });

  it('returns to the system language when another tab removes it', () => {
    localStorage.setItem('lang', 'es');
    const { result } = renderHook(() => useLanguage());
    act(() => {
      localStorage.removeItem('lang');
      window.dispatchEvent(new StorageEvent('storage', { key: 'lang', newValue: null }));
    });
    expect(result.current.language).toBe('en');
  });

  it('ignores storage events for other keys', () => {
    const { result } = renderHook(() => useLanguage());
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: 'dark' }));
    });
    expect(result.current.language).toBe('en');
  });

  it('prefers a language stored outside the hook when it next changes', () => {
    const { result } = renderHook(() => useLanguage());
    act(() => {
      result.current.toggleLanguage(); // es, not saved: it follows the system
      localStorage.setItem('lang', 'en'); // written elsewhere before the effect runs
    });
    expect(result.current.language).toBe('en');
  });

  it('returns to the system when the stored default disappears', () => {
    setBrowserLanguage('es-ES');
    const { result } = renderHook(() => useLanguage());
    act(() => {
      result.current.toggleLanguage(); // en
      result.current.saveLanguageAsDefault();
      localStorage.removeItem('lang'); // removed before the effect runs
    });
    expect(result.current.language).toBe('es');
  });

  describe('t', () => {
    it('translates a key in the current language', () => {
      localStorage.setItem('lang', 'es');
      const { result } = renderHook(() => useLanguage());
      expect(result.current.t('Unknown error')).toBe('Error desconocido');
    });

    it('returns an empty string for an empty key', () => {
      const { result } = renderHook(() => useLanguage());
      expect(result.current.t(undefined)).toBe('');
      expect(result.current.t(null)).toBe('');
      expect(result.current.t('')).toBe('');
    });

    it('falls back to a case-insensitive match, then to the key itself', () => {
      const { result } = renderHook(() => useLanguage());
      expect(result.current.t('INPUTTAB')).toBe('Input');
      expect(result.current.t('not a key')).toBe('not a key');
      expect(result.current.t(42)).toBe(42);
    });

    it('translates an API message object, keeping unknown parts', () => {
      localStorage.setItem('lang', 'es');
      const { result } = renderHook(() => useLanguage());
      expect(result.current.t({ message: 'Unknown error' })).toBe('Error desconocido');
      expect(result.current.t({ message: 'Something new' })).toBe('Something new');
    });
  });
});

describe('translateApiMessage', () => {
  const t = (k) => `<${k}>`;

  it('uses Unknown error for an empty message or one without text', () => {
    expect(translateApiMessage(t, '')).toBe('<Unknown error>');
    expect(translateApiMessage(t, { code: 1 })).toBe('<Unknown error>');
  });

  it('joins the parts of an array', () => {
    expect(translateApiMessage(t, ['a', 2])).toBe('<a>, <2>');
  });

  it('reads the message of an object', () => {
    expect(translateApiMessage(t, { message: 'x' })).toBe('<x>');
  });

  it('translates the prefix of a failed initial load and its detail', () => {
    expect(translateApiMessage(t, 'Failed to load initial data: Timeout')).toBe('<Failed to load initial data>: <Timeout>');
  });

  it('translates each part of a comma-separated message', () => {
    expect(translateApiMessage(t, 'a, b')).toBe('<a>, <b>');
  });

  it('keeps the deprecated alias', () => {
    expect(translateAuthMessage).toBe(translateApiMessage);
  });
});
