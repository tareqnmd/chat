import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AIProvider, ThemeMode } from '../../core/models/settings.model';
import { VerificationStatus } from '../../core/models/ui.model';
import { OpenaiService } from '../../core/services/openai.service';
import { SettingsService } from '../../core/services/settings.service';
import { IconAlertComponent, IconCheckComponent, IconCloseComponent } from '../icons';
import { ButtonComponent } from '../shared/button/button.component';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconCloseComponent,
    IconAlertComponent,
    IconCheckComponent,
    ButtonComponent,
  ],
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
            <icon-close class="w-5 h-5"></icon-close>
          </button>
        </div>

        <div class="p-6 flex flex-col gap-y-5 overflow-y-auto">
          <div class="flex flex-col gap-y-2">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
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
              <div
                class="mt-1 text-xs text-amber-600 dark:text-amber-500 flex items-center gap-x-1"
              >
                <icon-alert class="w-3 h-3"></icon-alert>
                Key is required
              </div>
            }
          </div>

          <div class="border-t border-slate-100 dark:border-slate-800 pt-5 flex flex-col gap-y-4">
            <h3 class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Model Configuration
            </h3>

            <div class="flex flex-col gap-y-2">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >Provider</label
              >
              <select
                [(ngModel)]="provider"
                (change)="onProviderChange()"
                class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm appearance-none"
              >
                <option [value]="AIProvider.OPENAI">Standard (OpenAI / Compatible)</option>
                <option [value]="AIProvider.CUSTOM">
                  Custom / Compatible (DeepSeek, Groq, etc.)
                </option>
              </select>
            </div>

            <div class="flex flex-col gap-y-2">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >Base URL</label
              >
              <input
                type="text"
                [(ngModel)]="baseUrl"
                [disabled]="provider === AIProvider.OPENAI"
                [class.opacity-50]="provider === AIProvider.OPENAI"
                class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-mono"
              />
              <div class="mt-1 text-xs text-slate-500">APIs compatible with OpenAI structure.</div>
            </div>

            <div class="flex flex-col gap-y-2">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300"
                >Model Name</label
              >
              <input
                type="text"
                [(ngModel)]="model"
                placeholder="e.g. gpt-4, deepseek-coder"
                class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-mono"
              />
            </div>

            <div class="flex justify-end">
              <app-button
                (onClick)="verifyConnection()"
                [disabled]="isVerifying || !apiKey"
                [loading]="isVerifying"
                variant="secondary"
                size="sm"
              >
                @if (verificationStatus === VerificationStatus.SUCCESS) {
                  <span class="text-green-500 font-medium flex items-center gap-x-1">
                    <icon-check class="w-3 h-3"></icon-check>
                    Verified
                  </span>
                } @else if (verificationStatus === VerificationStatus.ERROR) {
                  <span class="text-red-500 font-medium flex items-center gap-x-1">
                    <icon-close class="w-3 h-3"></icon-close>
                    Failed
                  </span>
                } @else {
                  <span class="flex items-center gap-x-1">Test Connection</span>
                }
              </app-button>
            </div>
          </div>
        </div>

        <div
          class="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 flex-shrink-0"
        >
          <app-button (onClick)="close.emit()" variant="ghost"> Cancel </app-button>
          <app-button (onClick)="saveSettings()" [disabled]="!apiKey" variant="primary">
            Save Changes
          </app-button>
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

  readonly AIProvider = AIProvider;
  readonly ThemeMode = ThemeMode;
  readonly VerificationStatus = VerificationStatus;

  apiKey = '';
  showKey = false;

  provider: AIProvider = AIProvider.OPENAI;
  baseUrl = 'https://api.openai.com/v1';
  model = 'gpt-3.5-turbo';
  theme: ThemeMode = ThemeMode.SYSTEM;

  isVerifying = false;
  verificationStatus: VerificationStatus = VerificationStatus.IDLE;

  constructor(
    private settingsService: SettingsService,
    private openaiService: OpenaiService,
  ) {
    const settings = this.settingsService.getSettings();
    this.apiKey = settings.apiKey || '';
    this.provider = settings.provider || AIProvider.OPENAI;
    this.baseUrl = settings.baseUrl || 'https://api.openai.com/v1';
    this.model = settings.model || 'gpt-3.5-turbo';
    this.theme = settings.theme || ThemeMode.SYSTEM;
  }

  onProviderChange(): void {
    if (this.provider === AIProvider.OPENAI) {
      this.baseUrl = 'https://api.openai.com/v1';
    } else {
      this.baseUrl = '';
    }
  }

  async verifyConnection(): Promise<void> {
    if (!this.apiKey) return;

    this.isVerifying = true;
    this.verificationStatus = VerificationStatus.IDLE;

    try {
      const isValid = await this.openaiService.checkConnection(this.baseUrl, this.apiKey);
      this.verificationStatus = isValid ? VerificationStatus.SUCCESS : VerificationStatus.ERROR;
    } catch (e) {
      this.verificationStatus = VerificationStatus.ERROR;
    } finally {
      this.isVerifying = false;

      setTimeout(() => {
        if (this.verificationStatus !== VerificationStatus.IDLE) {
          this.verificationStatus = VerificationStatus.IDLE;
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
