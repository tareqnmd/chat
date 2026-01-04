import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { AIProvider, ThemeMode, UserSettings } from '../models/settings.model';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private settingsSubject = new BehaviorSubject<UserSettings>(this.loadSettings());
  settings$ = this.settingsSubject.asObservable();

  private isDarkModeSubject = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this.isDarkModeSubject.asObservable();

  private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    this.mediaQuery.addEventListener('change', () => {
      if (this.settingsSubject.value.theme === ThemeMode.SYSTEM) {
        this.applyTheme(ThemeMode.SYSTEM);
      }
    });
    this.applyTheme(this.settingsSubject.value.theme);
  }

  private loadSettings(): UserSettings {
    const stored = localStorage.getItem('user-settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);

        return {
          apiKey: parsed.apiKey || null,
          provider: parsed.provider || AIProvider.OPENAI,
          baseUrl: parsed.baseUrl || 'https://api.openai.com/v1',
          model: parsed.model || 'gpt-3.5-turbo',
          theme: parsed.theme || ThemeMode.SYSTEM,
        };
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    return {
      apiKey: null,
      provider: AIProvider.OPENAI,
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-3.5-turbo',
      theme: ThemeMode.SYSTEM,
    };
  }

  saveSettings(settings: Partial<UserSettings>): void {
    const newSettings = { ...this.settingsSubject.value, ...settings };
    this.settingsSubject.next(newSettings);
    localStorage.setItem('user-settings', JSON.stringify(newSettings));
    this.applyTheme(newSettings.theme);
  }

  getApiKey(): string | null {
    return this.settingsSubject.value.apiKey;
  }

  getSettings(): UserSettings {
    return this.settingsSubject.value;
  }

  setApiKey(key: string): void {
    this.saveSettings({ apiKey: key });
  }

  clearApiKey(): void {
    this.saveSettings({ apiKey: null });
  }

  private applyTheme(theme: ThemeMode): void {
    let isDark = false;
    if (theme === ThemeMode.SYSTEM) {
      isDark = this.mediaQuery.matches;
    } else {
      isDark = theme === ThemeMode.DARK;
    }

    this.isDarkModeSubject.next(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
