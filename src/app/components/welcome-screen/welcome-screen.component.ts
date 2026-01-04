import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-welcome-screen',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center h-full p-4 text-center animate-fade-in">
      <div class="mb-12">
        <div
          class="w-12 h-12 mx-auto mb-4 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <svg
            class="w-6 h-6 text-slate-800 dark:text-slate-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            ></path>
          </svg>
        </div>
        <h2 class="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
          How can I help you today?
        </h2>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
        <button
          *ngFor="let prompt of suggestedPrompts"
          (click)="onPromptClick(prompt)"
          class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-left group"
        >
          <p
            class="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors"
          >
            {{ prompt }}
          </p>
        </button>
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
