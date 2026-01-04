import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';
import { Subject, takeUntil } from 'rxjs';
import { ChatState } from '../../core/models/message.model';
import { ChatService } from '../../core/services/chat.service';
import { SettingsService } from '../../core/services/settings.service';
import { MessageInputComponent } from '../message-input/message-input.component';
import { MessageListComponent } from '../message-list/message-list.component';
import { ClearChatToastComponent } from '../shared/clear-chat-toast.component';
import { WelcomeScreenComponent } from '../welcome-screen/welcome-screen.component';

@Component({
  selector: 'app-chat-container',
  standalone: true,
  imports: [CommonModule, MessageListComponent, MessageInputComponent, WelcomeScreenComponent],
  template: `
    <div class="h-full flex flex-col bg-bg-app overflow-hidden">
      <!-- Main Scrollable Area -->
      <div class="flex-1 overflow-y-auto w-full">
        <div class="min-h-full flex flex-col">
          @if (chatState.isInitialLoading && id && id !== 'new') {
            <div class="flex-1 flex items-center justify-center p-6 w-full">
              <div class="flex flex-col items-center gap-y-4 animate-pulse">
                <div
                  class="w-12 h-12 border-4 border-primary-main/20 border-t-primary-main rounded-full animate-spin"
                ></div>
                <span class="text-sm text-text-sub font-medium">Loading chat...</span>
              </div>
            </div>
          } @else if (chatState.error === 'Chat not found') {
            <div class="flex-1 flex flex-col items-center justify-center p-6 w-full">
              <div class="w-full max-w-md p-8 text-center animate-slide-up">
                <div
                  class="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 text-red-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-8 w-8"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Chat Not Found
                </h2>
                <p class="text-slate-500 dark:text-slate-400 mb-8">
                  This conversation might have been deleted or never existed.
                </p>
                <button
                  (click)="onNewChat()"
                  class="px-6 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-full font-medium transition-all hover:opacity-90 active:scale-95 shadow-sm"
                >
                  Start New Chat
                </button>
              </div>
            </div>
          } @else if (chatState.messages.length === 0) {
            <!-- Centered Welcome Screen -->
            <div class="flex-1 flex flex-col items-center justify-center p-6 w-full">
              <div class="w-full max-w-3xl animate-slide-up">
                <app-welcome-screen
                  (promptSelected)="onPromptSelected($event)"
                ></app-welcome-screen>
              </div>
            </div>
          } @else {
            <!-- Chat Message List -->
            <div class="max-w-3xl mx-auto w-full pb-4">
              <app-message-list [messages]="chatState.messages" #messageList></app-message-list>
            </div>
          }
        </div>
      </div>

      <!-- Sticky Footer -->
      <div class="flex-shrink-0 border-t border-border-fade bg-surface-app/80 backdrop-blur-sm">
        <app-message-input
          [isLoading]="chatState.isLoading"
          [error]="chatState.error"
          (sendMessage)="onSendMessage($event)"
        ></app-message-input>
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
    isInitialLoading: true,
    error: null,
  };

  isDarkMode = false;
  showSettings = false;
  public destroy$ = new Subject<void>();
  private shouldScrollToBottom: ScrollBehavior | null = null;

  @Input()
  set id(value: string | undefined) {
    if (!value || value === 'new') {
      this.chatService.deactivateSession();
    } else {
      this.chatService.activateSession(value);
    }
  }

  constructor(
    private chatService: ChatService,
    private settingsService: SettingsService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.chatService.chatState$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      const previousMessageCount = this.chatState.messages.length;
      this.chatState = state;

      if (state.error) {
        toast.error(state.error);
      }

      if (state.messages.length > previousMessageCount) {
        this.shouldScrollToBottom = previousMessageCount === 0 ? 'auto' : 'smooth';
      }
    });

    this.settingsService.isDarkMode$.pipe(takeUntil(this.destroy$)).subscribe((isDark) => {
      this.isDarkMode = isDark;
    });
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom(this.shouldScrollToBottom);
      this.shouldScrollToBottom = null;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async onSendMessage(message: string): Promise<void> {
    const apiKey = this.settingsService.getApiKey();
    if (!apiKey) {
      toast.error('API Key required to start a chat. Please go to Settings.');
      return;
    }

    let activeId = this.chatService.getActiveSessionId();
    if (!activeId) {
      activeId = await this.chatService.createSession();
      await this.router.navigate(['chat', activeId], { replaceUrl: true });
    }
    this.chatService.sendUserMessage(message);
  }

  async onPromptSelected(prompt: string): Promise<void> {
    const apiKey = this.settingsService.getApiKey();
    if (!apiKey) {
      toast.error('API Key required to start a chat. Please go to Settings.');
      return;
    }

    let activeId = this.chatService.getActiveSessionId();
    if (!activeId) {
      activeId = await this.chatService.createSession();
      await this.router.navigate(['chat', activeId], { replaceUrl: true });
    }
    this.chatService.sendUserMessage(prompt);
  }

  clearChat(): void {
    toast(ClearChatToastComponent);
  }

  onNewChat(): void {
    this.router.navigate(['/']);
  }

  private scrollToBottom(behavior: ScrollBehavior = 'auto'): void {
    try {
      const messageContainer = document.querySelector('.overflow-y-auto');
      if (messageContainer) {
        messageContainer.scrollTo({
          top: messageContainer.scrollHeight,
          behavior: behavior,
        });
      }
    } catch (err) {
      console.error('Scroll error:', err);
    }
  }
}
