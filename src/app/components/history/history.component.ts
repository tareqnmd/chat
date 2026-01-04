import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { map, Observable } from 'rxjs';
import { ChatSession } from '../../core/models/message.model';
import { ChatService } from '../../core/services/chat.service';
import { IconBackComponent, IconHistoryComponent, IconTrashComponent } from '../icons';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IconHistoryComponent,
    IconTrashComponent,
    IconBackComponent,
  ],
  template: `
    <div class="h-screen flex flex-col bg-white dark:bg-slate-950">
      <!-- Header -->
      <header
        class="sticky top-0 z-10 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800/50 px-4 py-3 flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <button
            routerLink="/"
            class="hidden md:flex items-center justify-center btn-icon"
            title="Back to Chat"
          >
            <icon-back class="w-5 h-5"></icon-back>
          </button>
          <button
            routerLink="/"
            class="md:hidden flex items-center justify-center btn-icon"
            title="Back to Chat"
          >
            <icon-back class="w-5 h-5"></icon-back>
          </button>
          <h1 class="text-base font-medium text-slate-700 dark:text-slate-200">Chat History</h1>
        </div>
      </header>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-4 md:p-6">
        <div class="max-w-3xl mx-auto space-y-4">
          @if ((sessions$ | async)?.length === 0) {
            <div class="flex flex-col items-center justify-center py-20 text-slate-400">
              <icon-history class="w-16 h-16 mb-4 opacity-50"></icon-history>
              <p class="text-lg font-medium">No chat history yet</p>
              <button
                routerLink="/chat/new"
                class="mt-4 px-5 py-2 text-sm font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:opacity-90 transition-opacity"
              >
                Start New Chat
              </button>
            </div>
          }

          @for (session of sessions$ | async; track session.id) {
            <div
              class="group flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              (click)="navigateToSession(session.id)"
            >
              <div class="flex-1 min-w-0 pr-4">
                <h3
                  class="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
                >
                  {{ session.title || 'Untitled Chat' }}
                </h3>
                <p class="text-xs text-slate-500 mt-1">
                  {{ session.updatedAt | date: 'medium' }} • {{ session.messages.length }} messages
                </p>
              </div>

              <button
                (click)="deleteSession(session.id, $event)"
                class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Delete Chat"
              >
                <icon-trash class="w-4.5 h-4.5"></icon-trash>
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class HistoryComponent implements OnInit {
  sessions$: Observable<ChatSession[]>;

  constructor(
    private chatService: ChatService,
    private router: Router,
  ) {
    this.sessions$ = this.chatService.sessions$.pipe(
      map((sessions) => {
        return Object.values(sessions).sort((a, b) => b.updatedAt - a.updatedAt);
      }),
    );
  }

  ngOnInit(): void {}

  navigateToSession(id: string): void {
    this.router.navigate(['chat', id]);
  }

  deleteSession(id: string, event: Event): void {
    event.stopPropagation(); // Prevent navigation
    if (confirm('Are you sure you want to delete this chat?')) {
      this.chatService.deleteSession(id);
    }
  }
}
