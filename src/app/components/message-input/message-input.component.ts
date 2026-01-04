import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconSendComponent } from '../icons';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [CommonModule, FormsModule, IconSendComponent],
  template: `
    <div class="max-w-3xl mx-auto p-4">
      <div class="relative group">
        <textarea
          #textarea
          [(ngModel)]="message"
          (keydown.enter)="onEnter($event)"
          [disabled]="isLoading"
          rows="1"
          placeholder="Type your message..."
          class="w-full pl-5 pr-14 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-slate-700/50 resize-none overflow-hidden min-h-[56px] text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        ></textarea>

        <button
          (click)="onSend()"
          [disabled]="!message.trim() || isLoading"
          class="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:shadow-none transition-all duration-200 ease-spring"
        >
          <icon-send class="w-4 h-4"></icon-send>
        </button>
      </div>

      <div class="mt-2 text-right pr-2">
        @if (error) {
          <p class="mb-1 text-xs text-red-500 flex justify-end items-center gap-1">
            {{ error }}
          </p>
        }
        <p class="text-[11px] text-slate-400 dark:text-slate-500 text-center">
          Internal GPT can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  `,
  styles: [],
})
export class MessageInputComponent {
  @Input() isLoading = false;
  @Input() error: string | null = null;
  @Output() sendMessage = new EventEmitter<string>();

  @ViewChild('textarea') textarea!: ElementRef<HTMLTextAreaElement>;

  message = '';

  onSend(): void {
    if (this.message.trim() && !this.isLoading) {
      this.sendMessage.emit(this.message.trim());
      this.message = '';
      this.resetHeight();
    }
  }

  onEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }

  private resetHeight() {
    if (this.textarea) {
      this.textarea.nativeElement.style.height = 'auto';
    }
  }
}
