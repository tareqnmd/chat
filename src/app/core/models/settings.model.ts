export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export enum AIProvider {
  OPENAI = 'openai',
  CUSTOM = 'custom',
}

export interface UserSettings {
  apiKey: string | null;
  provider: AIProvider;
  baseUrl: string;
  model: string;
  theme: ThemeMode;
}
