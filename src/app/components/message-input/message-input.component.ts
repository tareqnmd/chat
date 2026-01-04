import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800/50">
      <div class="max-w-3xl mx-auto">
        <form
          (ngSubmit)="onSubmit()"
          class="relative flex items-center gap-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-2 focus-within:ring-2 focus-within:ring-slate-200 dark:focus-within:ring-slate-700 focus-within:border-transparent transition-all"
        >
          <div class="flex-1 min-w-0">
            <input
              type="text"
              [(ngModel)]="messageText"
              name="message"
              [disabled]="isLoading"
              (keydown.enter)="onEnterKey($any($event))"
              placeholder="Send a message..."
              class="w-full px-3 py-3 bg-transparent border-none focus:ring-0 focus:outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-50 text-base"
              autocomplete="off"
            />
          </div>

          <button
            type="submit"
            [disabled]="!messageText.trim() || isLoading"
            class="p-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg hover:opacity-90 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-200"
          >
            @if (!isLoading) {
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 12h14M12 5l7 7-7 7"
                ></path>
              </svg>
            }
            @if (isLoading) {
              <svg
                class="w-4 h-4 animate-spin"
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
            }
          </button>
        </form>

        <div class="mt-2 text-right pr-2">
          <p class="text-[11px] text-slate-400 dark:text-slate-500">
            Internal GPT can make mistakes. Consider checking important information.
          </p>
          @if (error) {
            <div class="mt-2 inline-flex items-center gap-1.5 text-xs text-red-500">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>
              {{ error }}
            </div>
          }
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
