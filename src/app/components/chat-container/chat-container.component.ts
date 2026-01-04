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
import { ClearChatToastComponent } from '../shared/clear-chat-toast.component';
import { WelcomeScreenComponent } from '../welcome-screen/welcome-screen.component';

import { CommonModule } from '@angular/common';
import { MessageListComponent } from '../message-list/message-list.component';

@Component({
  selector: 'app-chat-container',
  standalone: true,
  imports: [CommonModule, MessageListComponent, MessageInputComponent, WelcomeScreenComponent],
  template: `
    <div class="h-full flex flex-col bg-white dark:bg-slate-950 overflow-hidden">
      <!-- Main Scrollable Area -->
      <div class="flex-1 overflow-y-auto w-full">
        <div class="min-h-full flex flex-col">
          @if (chatState.messages.length === 0) {
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
      <div
        class="flex-shrink-0 border-t border-slate-100 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm"
      >
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
    error: null,
  };

  isDarkMode = false;
  showSettings = false;
  public destroy$ = new Subject<void>();
  // Changed from boolean to ScrollBehavior | null
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
        // Instant scroll if loading fresh (from 0), smooth if adding new messages
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
    let activeId = this.chatService.getActiveSessionId();
    if (!activeId) {
      activeId = this.chatService.createSession();
      await this.router.navigate(['chat', activeId], { replaceUrl: true });
    }
    this.chatService.sendUserMessage(message);
  }

  async onPromptSelected(prompt: string): Promise<void> {
    let activeId = this.chatService.getActiveSessionId();
    if (!activeId) {
      activeId = this.chatService.createSession();
      await this.router.navigate(['chat', activeId], { replaceUrl: true });
    }
    this.chatService.sendUserMessage(prompt);
  }

  clearChat(): void {
    toast(ClearChatToastComponent, { duration: Infinity });
  }

  onNewChat(): void {
    this.router.navigate(['chat', 'new']);
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
