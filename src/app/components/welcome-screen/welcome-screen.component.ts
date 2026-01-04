import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-welcome-screen',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
      <div class="mb-8">
        <div
          class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-primary-500/30 animate-pulse-slow"
        >
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            ></path>
          </svg>
        </div>
        <h1
          class="text-4xl font-bold mb-3 bg-gradient-to-r from-primary-600 to-secondary-600 dark:from-primary-400 dark:to-secondary-400 bg-clip-text text-transparent"
        >
          AI Chat Assistant
        </h1>
        <p class="text-lg text-slate-600 dark:text-slate-400 max-w-md mx-auto">
          Powered by OpenAI GPT-3.5 Turbo
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
        <button
          *ngFor="let prompt of suggestedPrompts"
          (click)="onPromptClick(prompt)"
          class="glass p-4 rounded-xl hover:scale-105 transition-all duration-300 text-left group"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center flex-shrink-0 group-hover:from-primary-500/30 group-hover:to-secondary-500/30 transition-colors"
            >
              <svg
                class="w-4 h-4 text-primary-600 dark:text-primary-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ prompt }}</p>
            </div>
          </div>
        </button>
      </div>

      <div class="mt-12 flex items-center gap-6 text-sm text-slate-500 dark:text-slate-500">
        <div class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>AI Ready</span>
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            ></path>
          </svg>
          <span>Secure</span>
        </div>
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            ></path>
          </svg>
          <span>Fast Response</span>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class WelcomeScreenComponent {
  suggestedPrompts = [
    'Explain quantum computing in simple terms',
    'Write a creative short story',
    'Help me debug my code',
    'Suggest healthy meal ideas',
  ];

  onPromptClick(prompt: string): void {
    // This will be handled by parent component
    console.log('Prompt clicked:', prompt);
  }
}
