import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Message } from '../../models/message.model';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex-1 overflow-y-auto p-6 space-y-4" #messageContainer>
      <div
        *ngFor="let message of messages; trackBy: trackByMessageId"
        class="flex animate-slide-up"
        [class.justify-end]="message.role === 'user'"
      >
        <div class="max-w-[80%] md:max-w-[70%]" [class.ml-auto]="message.role === 'user'">
          <!-- User Message -->
          <div
            *ngIf="message.role === 'user'"
            class="bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl rounded-tr-sm px-5 py-3 shadow-lg shadow-primary-500/30"
          >
            <p class="text-sm leading-relaxed whitespace-pre-wrap">{{ message.content }}</p>
            <span class="text-xs opacity-75 mt-1 block">{{ formatTime(message.timestamp) }}</span>
          </div>

          <!-- AI Message -->
          <div *ngIf="message.role === 'assistant'" class="flex gap-3">
            <div
              class="w-8 h-8 rounded-full bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-secondary-500/30"
            >
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                ></path>
              </svg>
            </div>
            <div class="flex-1">
              <div class="glass-strong rounded-2xl rounded-tl-sm px-5 py-3">
                <p
                  *ngIf="!message.isTyping"
                  class="text-sm leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300"
                >
                  {{ message.content }}
                </p>
                <div *ngIf="message.isTyping" class="flex flex-col gap-2">
                  <p
                    *ngIf="message.content"
                    class="text-sm leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300"
                  >
                    {{ message.content }}
                  </p>
                  <div class="flex gap-1.5">
                    <div
                      class="w-2 h-2 bg-secondary-500 rounded-full animate-bounce"
                      style="animation-delay: 0ms"
                    ></div>
                    <div
                      class="w-2 h-2 bg-secondary-500 rounded-full animate-bounce"
                      style="animation-delay: 150ms"
                    ></div>
                    <div
                      class="w-2 h-2 bg-secondary-500 rounded-full animate-bounce"
                      style="animation-delay: 300ms"
                    ></div>
                  </div>
                </div>
                <span
                  *ngIf="!message.isTyping"
                  class="text-xs text-slate-500 dark:text-slate-500 mt-1 block"
                  >{{ formatTime(message.timestamp) }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class MessageListComponent {
  @Input() messages: Message[] = [];

  trackByMessageId(index: number, message: Message): string {
    return message.id;
  }

  formatTime(timestamp: Date): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
