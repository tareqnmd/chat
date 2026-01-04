import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { toast } from 'ngx-sonner';
import { ChatService } from '../../core/services/chat.service';

@Component({
  selector: 'app-delete-session-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full flex flex-col gap-3">
      <div class="text-sm font-medium text-slate-800 text-left">
        Are you sure you want to delete this chat?
      </div>
      <div class="flex gap-2 justify-end">
        <button
          (click)="onCancel()"
          class="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors rounded-lg hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          (click)="onConfirm()"
          class="px-3 py-1.5 text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-colors rounded-lg shadow-sm shadow-red-500/20"
        >
          Delete Chat
        </button>
      </div>
    </div>
  `,
  styles: [],
})
export class DeleteSessionToastComponent {
  constructor(private chatService: ChatService) {}

  onCancel() {
    this.chatService.setPendingDeleteId(null);
    toast.dismiss();
  }

  async onConfirm() {
    const id = this.chatService.getPendingDeleteId();
    if (id) {
      await this.chatService.deleteSession(id);
      this.chatService.setPendingDeleteId(null);
      toast.dismiss();
      toast.success('Chat deleted');
    }
  }
}
