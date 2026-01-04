import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ChatState } from '../../models/message.model';
import { ChatService } from '../../services/chat.service';
import { MessageInputComponent } from '../message-input/message-input.component';
import { MessageListComponent } from '../message-list/message-list.component';
import { WelcomeScreenComponent } from '../welcome-screen/welcome-screen.component';

@Component({
  selector: 'app-chat-container',
  standalone: true,
  imports: [CommonModule, MessageListComponent, MessageInputComponent, WelcomeScreenComponent],
  template: `
    <div class="h-screen flex flex-col">
      <!-- Header -->
      <header
        class="glass-strong border-b border-white/20 dark:border-slate-700/50 px-6 py-4 flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30"
          >
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              ></path>
            </svg>
          </div>
          <div>
            <h1 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
              AI Chat Assistant
            </h1>
            <p class="text-xs text-slate-500 dark:text-slate-400">Powered by OpenAI</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            *ngIf="chatState.messages.length > 0"
            (click)="clearChat()"
            class="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              ></path>
            </svg>
            Clear
          </button>

          <button
            (click)="toggleDarkMode()"
            class="p-2 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <svg
              *ngIf="!isDarkMode"
              class="w-5 h-5 text-slate-600 dark:text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              ></path>
            </svg>
            <svg
              *ngIf="isDarkMode"
              class="w-5 h-5 text-slate-600 dark:text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              ></path>
            </svg>
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <div class="flex-1 relative">
          <!-- Welcome Screen -->
          <div *ngIf="chatState.messages.length === 0" class="absolute inset-0">
            <app-welcome-screen></app-welcome-screen>
          </div>

          <!-- Messages -->
          <div *ngIf="chatState.messages.length > 0" class="h-full">
            <app-message-list [messages]="chatState.messages" #messageList> </app-message-list>
          </div>
        </div>

        <!-- Input -->
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
  private destroy$ = new Subject<void>();
  private shouldScrollToBottom = false;

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    // Subscribe to chat state
    this.chatService.chatState$.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      const previousMessageCount = this.chatState.messages.length;
      this.chatState = state;

      // Scroll to bottom when new messages arrive
      if (state.messages.length > previousMessageCount) {
        this.shouldScrollToBottom = true;
      }
    });

    // Check for dark mode preference
    this.isDarkMode =
      localStorage.getItem('darkMode') === 'true' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.applyDarkMode();
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

  clearChat(): void {
    if (confirm('Are you sure you want to clear all messages?')) {
      this.chatService.clearMessages();
    }
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    this.applyDarkMode();
  }

  private applyDarkMode(): void {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
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
