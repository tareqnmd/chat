import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OpenaiService } from '../../core/services/openai.service';
import { SettingsService } from '../../core/services/settings.service';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
    >
      <div
        class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 flex flex-col max-h-[90vh]"
      >
        <div
          class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50 flex-shrink-0"
        >
          <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100">Settings</h2>
          <button
            (click)="close.emit()"
            class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <div class="p-6 space-y-5 overflow-y-auto">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              API Key <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                [type]="showKey ? 'text' : 'password'"
                [(ngModel)]="apiKey"
                placeholder="sk-..."
                class="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
              />
              <button
                (click)="showKey = !showKey"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                @if (!showKey) {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z"
                    ></path>
                  </svg>
                }
                @if (showKey) {
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    ></path>
                  </svg>
                }
              </button>
            </div>
            @if (!apiKey) {
              <p class="mt-1 text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  ></path>
                </svg>
                Key is required
              </p>
            }
          </div>

          <div class="border-t border-slate-100 dark:border-slate-800 pt-5">
            <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Model Configuration
            </h3>

            <div class="mb-4">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >Provider</label
              >
              <select
                [(ngModel)]="provider"
                (change)="onProviderChange()"
                class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm appearance-none"
              >
                <option value="openai">Standard (OpenAI / Compatible)</option>
                <option value="custom">Custom / Compatible (DeepSeek, Groq, etc.)</option>
              </select>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >Base URL</label
              >
              <input
                type="text"
                [(ngModel)]="baseUrl"
                [disabled]="provider === 'openai'"
                [class.opacity-50]="provider === 'openai'"
                class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-mono"
              />
              <p class="mt-1 text-xs text-slate-500">APIs compatible with OpenAI structure.</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                >Model Name</label
              >
              <input
                type="text"
                [(ngModel)]="model"
                placeholder="e.g. gpt-4, deepseek-coder"
                class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-mono"
              />
            </div>

            <div class="mt-2 flex justify-end">
              <button
                type="button"
                (click)="verifyConnection()"
                [disabled]="isVerifying || !apiKey"
                class="text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                @if (isVerifying) {
                  <svg
                    class="animate-spin h-3 w-3"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Verifying...
                } @else {
                  @if (verificationStatus === 'success') {
                    <span class="text-green-500 font-medium flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                      Verified
                    </span>
                  } @else if (verificationStatus === 'error') {
                    <span class="text-red-500 font-medium flex items-center gap-1">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>
                      Failed
                    </span>
                  } @else {
                    <span class="flex items-center gap-1">Test Connection</span>
                  }
                }
              </button>
            </div>
          </div>
        </div>

        <div
          class="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 flex-shrink-0"
        >
          <button
            (click)="close.emit()"
            class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
          >
            Cancel
          </button>
          <button
            (click)="saveSettings()"
            [disabled]="!apiKey"
            class="px-5 py-2 text-sm font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .animate-fade-in {
        animation: fadeIn 0.2s ease-out;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `,
  ],
})
export class SettingsModalComponent {
  @Output() close = new EventEmitter<void>();

  apiKey = '';
  showKey = false;

  provider: 'openai' | 'custom' = 'openai';
  baseUrl = 'https://api.openai.com/v1';
  model = 'gpt-3.5-turbo';

  isVerifying = false;
  verificationStatus: 'idle' | 'success' | 'error' = 'idle';

  constructor(
    private settingsService: SettingsService,
    private openaiService: OpenaiService, // Inject for verification
  ) {
    const settings = this.settingsService.getSettings();
    this.apiKey = settings.apiKey || '';
    this.provider = settings.provider || 'openai';
    this.baseUrl = settings.baseUrl || 'https://api.openai.com/v1';
    this.model = settings.model || 'gpt-3.5-turbo';
  }

  onProviderChange(): void {
    if (this.provider === 'openai') {
      this.baseUrl = 'https://api.openai.com/v1';
    } else {
      this.baseUrl = ''; // Clear for custom
    }
  }

  async verifyConnection(): Promise<void> {
    if (!this.apiKey) return;

    this.isVerifying = true;
    this.verificationStatus = 'idle';

    try {
      const isValid = await this.openaiService.checkConnection(this.baseUrl, this.apiKey);
      this.verificationStatus = isValid ? 'success' : 'error';
    } catch (e) {
      this.verificationStatus = 'error';
    } finally {
      this.isVerifying = false;
      // Reset status after a few seconds
      setTimeout(() => {
        if (this.verificationStatus !== 'idle') {
          this.verificationStatus = 'idle';
        }
      }, 3000);
    }
  }

  saveSettings(): void {
    this.settingsService.saveSettings({
      apiKey: this.apiKey.trim() || null,
      provider: this.provider,
      baseUrl: this.baseUrl.trim(),
      model: this.model.trim(),
    });
    this.close.emit();
  }
}
