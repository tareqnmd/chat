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
import { NgxSonnerToaster, toast } from 'ngx-sonner';
import { Subject, takeUntil } from 'rxjs';
import { ChatState } from '../../core/models/message.model';
import { ChatService } from '../../core/services/chat.service';
import { SettingsService } from '../../core/services/settings.service';
import { MessageInputComponent } from '../message-input/message-input.component';
import { MessageListComponent } from '../message-list/message-list.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { SettingsModalComponent } from '../settings-modal/settings-modal.component';
import { ClearChatToastComponent } from '../shared/clear-chat-toast.component';
import { WelcomeScreenComponent } from '../welcome-screen/welcome-screen.component';

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
    NavbarComponent,
  ],
  template: `
    <ngx-sonner-toaster
      position="bottom-right"
      [expand]="true"
      [richColors]="true"
    ></ngx-sonner-toaster>

    <div class="h-screen flex flex-col bg-white dark:bg-slate-950">
      <app-navbar
        [hasMessages]="chatState.messages.length > 0"
        (openSettings)="showSettings = true"
        (clearChat)="clearChat()"
        (createNewChat)="onNewChat()"
      ></app-navbar>

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
  public destroy$ = new Subject<void>();
  private shouldScrollToBottom = false;

  @Input()
  set id(value: string) {
    if (value === 'new') {
      const newId = this.chatService.createSession();
      this.router.navigate(['chat', newId], { replaceUrl: true });
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

  onNewChat(): void {
    this.router.navigate(['chat', 'new']);
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
