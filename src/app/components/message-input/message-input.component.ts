import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconSendComponent } from '../icons';
import { ButtonComponent } from '../shared/button/button.component';
import { TextareaAutoresizeDirective } from '../shared/directives/textarea-autoresize.directive';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconSendComponent,
    ButtonComponent,
    TextareaAutoresizeDirective,
  ],
  template: `
    <div class="max-w-3xl mx-auto p-4">
      <div class="relative group">
        <textarea
          #textarea
          autofocus
          appTextareaAutoresize
          [(ngModel)]="message"
          (keydown.enter)="onEnter($event)"
          [disabled]="isLoading"
          rows="1"
          placeholder="Type your message..."
          class="w-full pl-5 pr-14 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-slate-700/50 resize-none overflow-hidden text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        ></textarea>

        <div class="absolute right-2 top-1/2 -translate-y-1/2">
          <app-button
            variant="icon"
            size="icon"
            (onClick)="onSend()"
            [disabled]="!message.trim() || isLoading"
          >
            <icon-send class="w-4 h-4 text-slate-900 dark:text-slate-100"></icon-send>
          </app-button>
        </div>
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
      // Reset height handled by binding or manually if needed,
      // but directive adjusts on input.
      // For reset, we might need a way to tell directive to reset or just manually set height.
      // Since directive listens to input, we can just manually reset here.
      setTimeout(() => {
        if (this.textarea) {
          this.textarea.nativeElement.style.height = 'auto'; // Reset to auto to recalc
        }
      });
    }
  }

  onEnter(event: Event): void {
    const keyboardEvent = event as KeyboardEvent;
    if (!keyboardEvent.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }
}
