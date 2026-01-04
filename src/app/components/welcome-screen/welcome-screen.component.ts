import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { IconBotComponent } from '../icons';

@Component({
  selector: 'app-welcome-screen',
  standalone: true,
  imports: [CommonModule, IconBotComponent],
  template: `
    <div
      class="w-full min-h-full flex flex-col items-center justify-center p-4 text-center gap-y-8"
    >
      <div class="flex flex-col items-center gap-y-6">
        <div
          class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm"
        >
          <icon-bot class="w-8 h-8 text-slate-700 dark:text-slate-200"></icon-bot>
        </div>

        <div class="flex flex-col items-center gap-y-2">
          <h2 class="text-2xl font-semibold text-slate-800 dark:text-slate-100">
            How can I help you today?
          </h2>
          <p class="text-slate-500 dark:text-slate-400 max-w-md">
            I can help you write code, analyze data, or answer questions.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
        @for (prompt of suggestedPrompts; track prompt) {
          <button
            (click)="onPromptClick(prompt)"
            class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-left group"
          >
            <p
              class="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors"
            >
              {{ prompt }}
            </p>
          </button>
        }
      </div>
    </div>
  `,
  styles: [],
})
export class WelcomeScreenComponent {
  @Output() promptSelected = new EventEmitter<string>();

  suggestedPrompts = [
    'Explain quantum computing in simple terms',
    'Write a creative short story about a robot',
    'Help me debug a JavaScript closure issue',
    'Suggest a healthy dinner recipe under 30 mins',
  ];

  onPromptClick(prompt: string): void {
    this.promptSelected.emit(prompt);
  }
}
