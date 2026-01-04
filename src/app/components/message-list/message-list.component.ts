import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Message } from '../../core/models/message.model';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex-1 overflow-y-auto p-4 md:p-6 space-y-6" #messageContainer>
      <div
        *ngFor="let message of messages; trackBy: trackByMessageId"
        class="group w-full text-slate-800 dark:text-slate-100 border-b border-black/5 dark:border-white/5 pb-6 last:border-0"
      >
        <div class="max-w-3xl mx-auto flex gap-4 md:gap-6">
          <!-- Avatar -->
          <div class="flex-shrink-0 flex flex-col relative items-end">
            <div
              *ngIf="message.role === 'user'"
              class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center"
            >
              <span class="text-sm font-semibold text-slate-600 dark:text-slate-300">U</span>
            </div>
            <div
              *ngIf="message.role === 'assistant'"
              class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center"
            >
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                ></path>
              </svg>
            </div>
          </div>

          <!-- Content -->
          <div class="relative flex-1 overflow-hidden">
            <!-- Name & Time -->
            <div class="flex items-center gap-2 mb-1">
              <span class="text-sm font-semibold">{{
                message.role === 'user' ? 'You' : 'AI Assistant'
              }}</span>
              <span class="text-xs text-slate-400 font-light">{{
                formatTime(message.timestamp)
              }}</span>
            </div>

            <!-- Message Text -->
            <div class="prose dark:prose-invert max-w-none text-[15px] leading-7">
              <p *ngIf="!message.isTyping" class="whitespace-pre-wrap">{{ message.content }}</p>

              <!-- Typing Indicator -->
              <div *ngIf="message.isTyping" class="flex flex-col gap-2">
                <p *ngIf="message.content" class="whitespace-pre-wrap">{{ message.content }}</p>
                <div *ngIf="!message.content" class="flex gap-1.5 py-1">
                  <div
                    class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style="animation-delay: 0ms"
                  ></div>
                  <div
                    class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style="animation-delay: 150ms"
                  ></div>
                  <div
                    class="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                    style="animation-delay: 300ms"
                  ></div>
                </div>
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
