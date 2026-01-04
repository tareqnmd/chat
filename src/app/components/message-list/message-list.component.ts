import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Message } from '../../core/models/message.model';
import { IconBotComponent, IconUserComponent } from '../icons';

interface ContentBlock {
  type: 'text' | 'code';
  content: string;
  language?: string;
}

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule, IconUserComponent, IconBotComponent],
  template: `
    <div class="p-4 md:p-6 space-y-8" #messageContainer>
      @for (message of messages; track message.id) {
        <div class="group w-full text-text-main border-b border-border-fade pb-8 last:border-0">
          <div class="max-w-3xl mx-auto flex gap-4 md:gap-6">
            <div class="flex-shrink-0 flex flex-col relative items-end">
              @if (message.role === 'user') {
                <div
                  class="w-10 h-10 rounded-2xl bg-surface-app border border-border-fade flex items-center justify-center shadow-sm"
                >
                  <icon-user class="w-6 h-6 text-text-sub"></icon-user>
                </div>
              }
              @if (message.role === 'assistant') {
                <div
                  class="w-10 h-10 rounded-2xl bg-primary-main flex items-center justify-center shadow-md shadow-primary-main/10"
                >
                  <icon-bot class="w-6 h-6 text-white"></icon-bot>
                </div>
              }
            </div>

            <div class="relative flex-1 overflow-hidden">
              <div class="flex flex-col gap-y-2">
                <div class="flex items-center gap-x-3">
                  <span class="text-sm font-semibold tracking-tight">{{
                    message.role === 'user' ? 'You' : 'AI Assistant'
                  }}</span>
                  <span
                    class="text-[10px] text-text-dim font-medium uppercase tracking-widest opacity-60"
                    >{{ formatTime(message.timestamp) }}</span
                  >
                </div>

                <div
                  class="prose dark:prose-invert max-w-none text-[15px] leading-relaxed flex flex-col gap-y-4"
                >
                  @if (!message.isTyping) {
                    @for (block of parseContent(message.content); track block.content) {
                      @if (block.type === 'text') {
                        <p class="whitespace-pre-wrap">{{ block.content }}</p>
                      }
                      @if (block.type === 'code') {
                        <div
                          class="relative group/code rounded-xl overflow-hidden border border-border-strong bg-slate-950 dark:bg-black/40 shadow-sm"
                        >
                          <div
                            class="flex items-center justify-between px-4 py-2 bg-slate-900 dark:bg-black/60 border-b border-white/5"
                          >
                            <span
                              class="text-[10px] uppercase font-bold text-slate-400 tracking-widest"
                              >{{ block.language || 'code' }}</span
                            >
                            <button
                              (click)="copyToClipboard(block.content, $event)"
                              class="text-[10px] font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/5"
                            >
                              <span>Copy</span>
                            </button>
                          </div>
                          <pre
                            class="p-4 overflow-x-auto text-[13px] text-slate-300 font-mono leading-6"
                          ><code>{{ block.content }}</code></pre>
                        </div>
                      }
                    }
                  }

                  @if (message.isTyping) {
                    <div class="flex flex-col gap-y-2">
                      @if (message.content) {
                        <p class="whitespace-pre-wrap">{{ message.content }}</p>
                      }
                      @if (!message.content) {
                        <div class="flex gap-x-1.5 py-4">
                          <div
                            class="w-2.5 h-2.5 bg-primary-main/30 rounded-full animate-bounce"
                            style="animation-delay: 100ms"
                          ></div>
                          <div
                            class="w-2.5 h-2.5 bg-primary-main/50 rounded-full animate-bounce"
                            style="animation-delay: 200ms"
                          ></div>
                          <div
                            class="w-2.5 h-2.5 bg-primary-main/70 rounded-full animate-bounce"
                            style="animation-delay: 300ms"
                          ></div>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [],
})
export class MessageListComponent {
  @Input() messages: Message[] = [];

  trackByMessageId(index: number, message: Message): string {
    return message.id;
  }

  formatTime(timestamp: any): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  parseContent(content: string): ContentBlock[] {
    if (!content) return [];

    const blocks: ContentBlock[] = [];
    const regex = /```(\w*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        blocks.push({
          type: 'text',
          content: content.slice(lastIndex, match.index),
        });
      }
      blocks.push({
        type: 'code',
        language: match[1] || 'plaintext',
        content: match[2].trim(),
      });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      blocks.push({
        type: 'text',
        content: content.slice(lastIndex),
      });
    }

    return blocks;
  }

  copyToClipboard(text: string, event: MouseEvent): void {
    const btn = event.currentTarget as HTMLElement;
    const originalText = btn.innerHTML;

    navigator.clipboard.writeText(text).then(() => {
      btn.innerHTML = '<span>Copied!</span>';
      btn.style.color = '#10b981'; // green-500
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.color = '';
      }, 2000);
    });
  }
}
