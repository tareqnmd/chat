import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { ChatSession } from '../../core/models/message.model';
import { ChatService } from '../../core/services/chat.service';
import { IconHistoryComponent, IconPlusComponent, IconTrashComponent } from '../icons';
import { ButtonComponent } from '../shared/button/button.component';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    IconHistoryComponent,
    IconTrashComponent,
    IconPlusComponent,
    ButtonComponent,
  ],
  template: `
    <div class="h-full flex flex-col bg-bg-app overflow-hidden">
      <!-- Search & Actions Header -->
      <div class="px-4 py-4 md:px-6 border-b border-border-fade bg-surface-app/50 backdrop-blur-sm">
        <div class="max-w-3xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
          <div class="relative w-full md:max-w-md">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange($event)"
              placeholder="Search chat history..."
              class="w-full pl-4 pr-10 py-2 bg-bg-app border border-border-strong rounded-xl text-sm text-text-main focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main transition-all outline-none"
            />
            @if (searchQuery) {
              <button
                (click)="clearSearch()"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-main"
              >
                <icon-trash class="w-4 h-4"></icon-trash>
              </button>
            }
          </div>

          <app-button
            (onClick)="createNewChat()"
            variant="primary"
            size="sm"
            className="hidden md:flex items-center gap-2"
          >
            <icon-plus class="w-4 h-4"></icon-plus>
            <span>New Chat</span>
          </app-button>
        </div>
      </div>

      <!-- History List -->
      <div class="flex-1 overflow-y-auto p-4 md:p-6">
        <div class="max-w-3xl mx-auto space-y-3">
          @if ((filteredSessions$ | async)?.length === 0) {
            <div class="flex flex-col items-center justify-center py-20 text-text-dim gap-y-6">
              <div class="flex flex-col items-center gap-y-4">
                <icon-history class="w-16 h-16 opacity-20"></icon-history>
                <p class="text-sm font-medium">
                  {{ searchQuery ? 'No chats match your search' : 'Your chat history is empty' }}
                </p>
              </div>
              @if (!searchQuery) {
                <app-button routerLink="/" variant="primary" size="md"> Start New Chat </app-button>
              } @else {
                <app-button (onClick)="clearSearch()" variant="secondary" size="sm">
                  Clear Search
                </app-button>
              }
            </div>
          }

          @for (session of filteredSessions$ | async; track session.id) {
            <div
              class="group flex items-center justify-between p-4 rounded-2xl border border-border-fade bg-surface-app hover:border-border-strong hover:bg-bg-app/50 transition-all cursor-pointer"
              (click)="navigateToSession(session.id)"
            >
              <div class="flex-1 min-w-0 pr-4 flex flex-col gap-y-1.5">
                <h3
                  class="text-sm font-medium text-text-main truncate group-hover:text-primary-main transition-colors"
                >
                  {{ session.title || 'Untitled Chat' }}
                </h3>
                <div class="flex items-center gap-x-2">
                  <span
                    class="text-[10px] px-1.5 py-0.5 rounded-md bg-bg-app text-text-dim font-medium uppercase tracking-wider"
                  >
                    {{ session.messages.length }} messages
                  </span>
                  <span class="text-[10px] text-text-dim">
                    Last active {{ session.updatedAt | date: 'MMM d, h:mm a' }}
                  </span>
                </div>
              </div>

              <div class="flex items-center gap-x-1">
                <button
                  (click)="deleteSession(session.id, $event)"
                  class="p-2 text-text-dim hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Delete Chat"
                >
                  <icon-trash class="w-5 h-5"></icon-trash>
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class HistoryComponent implements OnInit {
  private searchQuery$ = new BehaviorSubject<string>('');
  searchQuery = '';

  filteredSessions$: Observable<ChatSession[]>;

  constructor(
    private chatService: ChatService,
    private router: Router,
  ) {
    this.filteredSessions$ = combineLatest([this.chatService.sessions$, this.searchQuery$]).pipe(
      map(([sessions, query]) => {
        const sessionList = Object.values(sessions).sort((a, b) => b.updatedAt - a.updatedAt);
        if (!query) return sessionList;

        const lowerQuery = query.toLowerCase();
        return sessionList.filter(
          (s) =>
            s.title.toLowerCase().includes(lowerQuery) ||
            s.messages.some((m) => m.content.toLowerCase().includes(lowerQuery)),
        );
      }),
    );
  }

  ngOnInit(): void {}

  onSearchChange(query: string): void {
    this.searchQuery$.next(query);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searchQuery$.next('');
  }

  navigateToSession(id: string): void {
    this.router.navigate(['chat', id]);
  }

  async createNewChat(): Promise<void> {
    const id = await this.chatService.createSession();
    this.router.navigate(['chat', id]);
  }

  async deleteSession(id: string, event: Event): Promise<void> {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
      await this.chatService.deleteSession(id);
    }
  }
}
