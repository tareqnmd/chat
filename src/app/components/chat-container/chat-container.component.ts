import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NgxSonnerToaster, toast } from 'ngx-sonner';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ChatState } from '../../core/models/message.model';
import { ChatService } from '../../core/services/chat.service';
import { SettingsService } from '../../core/services/settings.service';
import { MessageInputComponent } from '../message-input/message-input.component';
import { MessageListComponent } from '../message-list/message-list.component';
import { SettingsModalComponent } from '../settings-modal/settings-modal.component';
import { WelcomeScreenComponent } from '../welcome-screen/welcome-screen.component';

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

@Component({
  selector: 'app-chat-container',
  standalone: true,
  imports: [
    CommonModule,
    MessageListComponent,
    MessageInputComponent,
    WelcomeScreenComponent,
    SettingsModalComponent,
    NgxSonnerToaster,
  ],
  template: `
    <ngx-sonner-toaster
      position="bottom-right"
      [expand]="true"
      [richColors]="true"
    ></ngx-sonner-toaster>

    <div class="h-screen flex flex-col bg-white dark:bg-slate-950">
      <header
        class="sticky top-0 z-10 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800/50 px-4 py-3 flex items-center justify-between"
      >
        <div class="flex items-center gap-2" (click)="reloadPage()" class="cursor-pointer">
          <h1 class="text-base font-medium text-slate-700 dark:text-slate-200">
            Internal GPT
            <span class="text-slate-400 font-normal text-xs ml-1">{{
              (settings$ | async)?.model
            }}</span>
          </h1>
        </div>

        <div class="flex items-center gap-1">
          @if (chatState.messages.length > 0) {
            <button (click)="clearChat()" class="btn-icon" title="Clear Chat">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                ></path>
              </svg>
            </button>
          }

          <button (click)="toggleDarkMode()" class="btn-icon" title="Toggle Theme">
            @if (!isDarkMode) {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                ></path>
              </svg>
            }
            @if (isDarkMode) {
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                ></path>
              </svg>
            }
          </button>

          <button (click)="showSettings = true" class="btn-icon" title="Settings">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              ></path>
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
            </svg>
          </button>
        </div>
      </header>

      @if (showSettings) {
        <app-settings-modal (close)="showSettings = false"></app-settings-modal>
      }
      <div class="flex-1 flex flex-col overflow-hidden relative">
        <div class="flex-1 relative overflow-hidden">
          @if (chatState.messages.length === 0) {
            <div class="absolute inset-0 z-0">
              <app-welcome-screen (promptSelected)="onPromptSelected($event)"></app-welcome-screen>
            </div>
          }

          @if (chatState.messages.length > 0) {
            <div class="h-full relative z-10">
              <div class="h-full max-w-3xl mx-auto w-full">
                <app-message-list [messages]="chatState.messages" #messageList> </app-message-list>
              </div>
            </div>
          }
        </div>

        <app-message-input
          [isLoading]="chatState.isLoading"
          [error]="chatState.error"
          (sendMessage)="onSendMessage($event)"
        >
        </app-message-input>
      </div>
    </div>
  `,
  styles: [],
})
export class ChatContainerComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messageList', { read: ElementRef }) messageListRef?: ElementRef;

  chatState: ChatState = {
    messages: [],
    isLoading: false,
    error: null,
  };

  isDarkMode = false;
  showSettings = false;
  settings$!: Observable<any>;
  public destroy$ = new Subject<void>();
  private shouldScrollToBottom = false;

  constructor(
    private chatService: ChatService,
    private settingsService: SettingsService,
  ) {}

  ngOnInit(): void {
    this.settings$ = this.settingsService.settings$; // Initialize here

    this.chatService.chatState$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      const previousMessageCount = this.chatState.messages.length;
      this.chatState = state;

      if (state.error) {
        toast.error(state.error);
      }

      if (state.messages.length > previousMessageCount) {
        this.shouldScrollToBottom = true;
      }
    });

    this.settingsService.isDarkMode$.pipe(takeUntil(this.destroy$)).subscribe((isDark) => {
      this.isDarkMode = isDark;
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSendMessage(message: string): void {
    this.chatService.sendUserMessage(message);
  }

  onPromptSelected(prompt: string): void {
    this.chatService.sendUserMessage(prompt);
  }

  clearChat(): void {
    toast(ClearChatToastComponent, { duration: Infinity });
  }

  toggleDarkMode(): void {
    const currentTheme = this.settingsService.getSettings().theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.settingsService.saveSettings({ theme: newTheme });
  }

  reloadPage(): void {
    window.location.reload();
  }

  private scrollToBottom(): void {
    try {
      const messageContainer = document.querySelector('.overflow-y-auto');
      if (messageContainer) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
      }
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }
}
