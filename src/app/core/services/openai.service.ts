import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { OpenAIMessage } from '../models/message.model';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root',
})
export class OpenaiService {
  constructor(private settingsService: SettingsService) {}

  private getHeaders(): HeadersInit {
    const apiKey = this.settingsService.getApiKey() || environment.openaiApiKey;
    if (!apiKey) {
      throw new Error('API Key is missing. Please add it in Settings.');
    }
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    };
  }

  private getApiUrl(): string {
    const settings = this.settingsService.getSettings();
    let baseUrl = settings.baseUrl.trim();
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }

    return `${baseUrl}/chat/completions`;
  }

  async sendMessage(messages: OpenAIMessage[]): Promise<string> {
    const settings = this.settingsService.getSettings();
    try {
      const response = await fetch(this.getApiUrl(), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: settings.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `API Error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'No response received';
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async sendMessageStream(
    messages: OpenAIMessage[],
    onChunk: (chunk: string) => void,
  ): Promise<void> {
    const settings = this.settingsService.getSettings();
    try {
      const response = await fetch(this.getApiUrl(), {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: settings.model,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
          stream: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `API Error: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (e) {}
          }
        }
      }
    } catch (error) {
      console.error('API Stream Error:', error);
      throw error;
    }
  }
}
