import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

type ThemeMode = 'system' | 'light' | 'dark';

declare global {
  interface Window {
    SOMARA_THEME_MODE?: ThemeMode;
    setSomaraThemeMode?: (mode: ThemeMode) => void;
  }
}

const applyThemeMode = (mode: ThemeMode) => {
  const root = document.documentElement;
  root.style.setProperty('--somara-theme-mode', mode);

  if (mode === 'system') {
    root.removeAttribute('data-theme');
    return;
  }

  root.setAttribute('data-theme', mode);
};

const getInitialThemeMode = (): ThemeMode => {
  const mode = window.SOMARA_THEME_MODE;
  return mode === 'light' || mode === 'dark' || mode === 'system' ? mode : 'light';
};

applyThemeMode(getInitialThemeMode());
window.setSomaraThemeMode = applyThemeMode;

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
