import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="p-4 border-t border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
    >
      <form (ngSubmit)="onSubmit()" class="flex gap-3">
        <div class="flex-1 relative">
          <input
            type="text"
            [(ngModel)]="messageText"
            name="message"
            [disabled]="isLoading"
            (keydown.enter)="onEnterKey($any($event))"
            placeholder="Type your message..."
            class="w-full px-5 py-3 rounded-xl glass-strong focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-all text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div
            *ngIf="messageText.length > 0"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400"
          >
            {{ messageText.length }}
          </div>
        </div>

        <button
          type="submit"
          [disabled]="!messageText.trim() || isLoading"
          class="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-slate-300 disabled:to-slate-400 dark:disabled:from-slate-700 dark:disabled:to-slate-800 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 disabled:shadow-none hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
        >
          <span *ngIf="!isLoading">Send</span>
          <span *ngIf="isLoading">Sending...</span>
          <svg
            *ngIf="!isLoading"
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            ></path>
          </svg>
          <svg
            *ngIf="isLoading"
            class="w-5 h-5 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            ></path>
          </svg>
        </button>
      </form>

      <div
        *ngIf="error"
        class="mt-3 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-sm text-red-700 dark:text-red-400 flex items-start gap-2"
      >
        <svg
          class="w-5 h-5 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <div>
          <p class="font-medium">Error</p>
          <p class="mt-1">{{ error }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class MessageInputComponent {
  @Input() isLoading = false;
  @Input() error: string | null = null;
  @Output() sendMessage = new EventEmitter<string>();

  messageText = '';

  onSubmit(): void {
    if (this.messageText.trim() && !this.isLoading) {
      this.sendMessage.emit(this.messageText.trim());
      this.messageText = '';
    }
  }

  onEnterKey(event: KeyboardEvent): void {
    if (!event.shiftKey) {
      event.preventDefault();
      this.onSubmit();
    }
  }
}
