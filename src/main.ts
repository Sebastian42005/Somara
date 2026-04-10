import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

type ThemeMode = 'system' | 'light' | 'dark';
const THEME_MODE_STORAGE_KEY = 'somara.theme-mode';

declare global {
  interface Window {
    SOMARA_THEME_MODE?: ThemeMode;
    setSomaraThemeMode?: (mode: ThemeMode) => void;
  }
}

const applyThemeMode = (mode: ThemeMode) => {
  const root = document.documentElement;
  root.style.setProperty('--somara-theme-mode', mode);
  window.SOMARA_THEME_MODE = mode;

  if (mode === 'system') {
    root.removeAttribute('data-theme');
    return;
  }

  root.setAttribute('data-theme', mode);
};

const getInitialThemeMode = (): ThemeMode => {
  try {
    const persistedMode = window.localStorage.getItem(THEME_MODE_STORAGE_KEY);
    if (persistedMode === 'light' || persistedMode === 'dark' || persistedMode === 'system') {
      return persistedMode;
    }
  } catch {
    // Ignore storage issues and fallback to runtime/default values.
  }

  const mode = window.SOMARA_THEME_MODE;
  return mode === 'light' || mode === 'dark' || mode === 'system' ? mode : 'light';
};

applyThemeMode(getInitialThemeMode());
window.setSomaraThemeMode = applyThemeMode;

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
