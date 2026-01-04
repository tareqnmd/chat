import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface UserSettings {
  apiKey: string | null;
  theme: 'light' | 'dark' | 'system';
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private settingsSubject = new BehaviorSubject<UserSettings>(this.loadSettings());
  settings$ = this.settingsSubject.asObservable();

  constructor() {}

  private loadSettings(): UserSettings {
    const stored = localStorage.getItem('user-settings');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    return {
      apiKey: null,
      theme: 'system',
    };
  }

  saveSettings(settings: Partial<UserSettings>): void {
    const newSettings = { ...this.settingsSubject.value, ...settings };
    this.settingsSubject.next(newSettings);
    localStorage.setItem('user-settings', JSON.stringify(newSettings));
  }

  getApiKey(): string | null {
    return this.settingsSubject.value.apiKey;
  }

  setApiKey(key: string): void {
    this.saveSettings({ apiKey: key });
  }

  clearApiKey(): void {
    this.saveSettings({ apiKey: null });
  }
}
