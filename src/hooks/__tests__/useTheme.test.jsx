import { vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';

// A controllable prefers-color-scheme media query
let systemDark = false;
let listeners = [];
const mediaQuery = () => ({
  get matches() {
    return systemDark;
  },
  addEventListener: (_type, fn) => listeners.push(fn),
  removeEventListener: (_type, fn) => {
    listeners = listeners.filter((l) => l !== fn);
  },
});
const systemChanges = (dark) => {
  systemDark = dark;
  listeners.forEach((fn) => fn({ matches: dark }));
};

const brand = () => document.documentElement.style.getPropertyValue('--brand-primary');
const themeColor = () => document.querySelector('meta[name="theme-color"]').getAttribute('content');

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    systemDark = false;
    listeners = [];
    window.matchMedia = vi.fn(mediaQuery);
    document.head.innerHTML = '<meta name="theme-color" content="">';
  });

  it('follows the system theme when nothing is stored, and applies its colors', () => {
    systemDark = true;
    const { result } = renderHook(() => useTheme());
    expect(result.current.isDarkMode).toBe(true);
    expect(brand()).toBe('#023965');
    expect(themeColor()).toBe('#023965');
  });

  it('follows the system when it changes, and stops listening on unmount', () => {
    const { result, unmount } = renderHook(() => useTheme());
    expect(brand()).toBe('#01579b');
    act(() => systemChanges(true));
    expect(result.current.isDarkMode).toBe(true);
    unmount();
    expect(listeners).toHaveLength(0);
  });

  it('starts from a stored light or dark preference', () => {
    localStorage.setItem('themePreference', 'dark');
    expect(renderHook(() => useTheme()).result.current.isDarkMode).toBe(true);
    localStorage.setItem('themePreference', 'light');
    systemDark = true;
    expect(renderHook(() => useTheme()).result.current.isDarkMode).toBe(false);
  });

  it('toggles without saving while it follows the system', () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggleDarkMode());
    expect(result.current.isDarkMode).toBe(true);
    expect(localStorage.getItem('themePreference')).toBeNull();
  });

  it('saves the current theme as the default, then saves each toggle and ignores the system', () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.saveThemeAsDefault());
    expect(localStorage.getItem('themePreference')).toBe('light');
    act(() => result.current.toggleDarkMode());
    expect(localStorage.getItem('themePreference')).toBe('dark');
    expect(listeners).toHaveLength(0);
  });

  it('restores the system default', () => {
    localStorage.setItem('themePreference', 'light');
    systemDark = true;
    const { result } = renderHook(() => useTheme());
    act(() => result.current.restoreSystemDefault());
    expect(localStorage.getItem('themePreference')).toBeNull();
    expect(result.current.isDarkMode).toBe(true);
  });
});
