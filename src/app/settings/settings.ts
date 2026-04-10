import { Component, signal } from '@angular/core';

type ThemeMode = 'system' | 'light' | 'dark';
const THEME_MODE_STORAGE_KEY = 'somara.theme-mode';

declare global {
  interface Window {
    SOMARA_THEME_MODE?: ThemeMode;
    setSomaraThemeMode?: (mode: ThemeMode) => void;
  }
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  readonly themeOptions: ReadonlyArray<{ label: string; value: ThemeMode }> = [
    { label: 'System', value: 'system' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ];

  readonly activeThemeMode = signal<ThemeMode>(this.resolveInitialThemeMode());

  setThemeMode(mode: ThemeMode): void {
    this.activeThemeMode.set(mode);
    window.setSomaraThemeMode?.(mode);
    window.SOMARA_THEME_MODE = mode;

    try {
      window.localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
    } catch {
      // Ignore storage issues, theme is still applied to current runtime.
    }
  }

  private resolveInitialThemeMode(): ThemeMode {
    try {
      const persistedMode = window.localStorage.getItem(THEME_MODE_STORAGE_KEY);
      if (persistedMode === 'light' || persistedMode === 'dark' || persistedMode === 'system') {
        return persistedMode;
      }
    } catch {
      // Ignore storage issues and fallback to runtime/default values.
    }

    const runtimeMode = window.SOMARA_THEME_MODE;
    if (runtimeMode === 'light' || runtimeMode === 'dark' || runtimeMode === 'system') {
      return runtimeMode;
    }

    return 'light';
  }
}
