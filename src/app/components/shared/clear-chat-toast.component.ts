import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { toast } from 'ngx-sonner';
import { ChatService } from '../../core/services/chat.service';

@Component({
  selector: 'app-clear-chat-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full flex flex-col gap-3">
      <div class="text-sm font-medium text-slate-800 dark:text-slate-200 text-left">
        Are you sure you want to clear the conversation?
      </div>
      <div class="flex gap-2 justify-end">
        <button
          (click)="onCancel()"
          class="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900"
        >
          Cancel
        </button>
        <button
          (click)="onConfirm()"
          class="px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-colors rounded-lg shadow-sm shadow-red-500/20"
        >
          Clear Chat
        </button>
      </div>
    </div>
  `,
  styles: [],
})
export class ClearChatToastComponent {
  constructor(private chatService: ChatService) {}

  onCancel() {
    toast.dismiss();
  }

  onConfirm() {
    this.chatService.clearMessages();
    toast.dismiss();
    toast.success('Chat cleared');
  }
}
