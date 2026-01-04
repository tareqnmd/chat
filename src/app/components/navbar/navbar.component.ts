import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SettingsService } from '../../core/services/settings.service';
import {
  IconHistoryComponent,
  IconMoonComponent,
  IconPlusComponent,
  IconSettingsComponent,
  IconSunComponent,
  IconTrashComponent,
} from '../icons';
import { ButtonComponent } from '../shared/button/button.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IconPlusComponent,
    IconHistoryComponent,
    IconTrashComponent,
    IconSunComponent,
    IconMoonComponent,
    IconSettingsComponent,
    ButtonComponent,
  ],
  template: `
    <header
      class="sticky top-0 z-10 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800/50 px-4 py-3 flex items-center justify-between"
    >
      <div class="flex items-center gap-2 cursor-pointer" (click)="reloadPage()">
        <h1 class="text-base font-medium text-slate-700 dark:text-slate-200">
          Chat
          <span class="text-slate-400 font-normal text-xs ml-1 max-sm:hidden">{{
            (settingsService.settings$ | async)?.model
          }}</span>
        </h1>
      </div>

      <div class="flex items-center gap-1">
        <!-- New Chat Button (Desktop) -->
        <div class="flex-1 flex justify-end">
          <app-button
            (onClick)="createNewChat.emit()"
            [disabled]="!hasMessages"
            variant="primary"
            size="sm"
            className="max-md:hidden flex items-center gap-2"
          >
            <icon-plus class="w-4 h-4"></icon-plus>
            <span>New Chat</span>
          </app-button>

          <!-- Mobile New Chat (Icon only) -->
          <app-button
            (onClick)="createNewChat.emit()"
            [disabled]="!hasMessages"
            variant="primary"
            size="icon"
            className="md:hidden flex items-center justify-center rounded-full w-8 h-8 p-0"
          >
            <icon-plus class="w-4 h-4"></icon-plus>
          </app-button>
        </div>

        <!-- Desktop History -->
        <a
          routerLink="/history"
          class="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mr-1"
        >
          <icon-history class="w-4 h-4"></icon-history>
          History
        </a>

        <!-- Mobile History -->
        <button routerLink="/history" class="md:hidden ml-2 btn-icon" title="History">
          <icon-history class="w-5 h-5"></icon-history>
        </button>

        @if (hasMessages) {
          <button (click)="clearChat.emit()" class="btn-icon" title="Clear Chat">
            <icon-trash class="w-5 h-5"></icon-trash>
          </button>
        }

        <button (click)="toggleDarkMode()" class="btn-icon" title="Toggle Theme">
          @if (settingsService.isDarkMode$ | async) {
            <icon-sun class="w-5 h-5"></icon-sun>
          } @else {
            <icon-moon class="w-5 h-5"></icon-moon>
          }
        </button>

        <button (click)="openSettings.emit()" class="btn-icon" title="Settings">
          <icon-settings class="w-5 h-5"></icon-settings>
        </button>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  @Input() hasMessages = false;
  @Output() openSettings = new EventEmitter<void>();
  @Output() clearChat = new EventEmitter<void>();
  @Output() createNewChat = new EventEmitter<void>();

  constructor(public settingsService: SettingsService) {}

  toggleDarkMode(): void {
    const currentTheme = this.settingsService.getSettings().theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.settingsService.saveSettings({ theme: newTheme });
  }

  reloadPage(): void {
    window.location.reload();
  }
}
