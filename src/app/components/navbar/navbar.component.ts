import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterModule } from '@angular/router';
import { APP_METADATA } from '../../core/config/app-metadata.config';
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
      class="sticky top-0 z-10 bg-bg-app border-b border-border-fade px-4 py-3 flex items-center justify-between"
    >
      <a routerLink="/" class="flex items-center gap-2 group transition-opacity hover:opacity-80">
        <h1 class="text-base font-medium text-text-main">
          {{ appTitle }}
          <span class="text-text-dim font-normal text-xs ml-1 max-sm:hidden">{{
            (settingsService.settings$ | async)?.model
          }}</span>
        </h1>
      </a>

      <div class="flex items-center gap-2">
        <div class="flex-1 flex justify-end">
          @if (hasMessages) {
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
          }

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

        <a
          routerLink="/history"
          class="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-sub hover:bg-border-fade transition-colors"
        >
          <icon-history class="w-6 h-6"></icon-history>
        </a>

        <a routerLink="/history" class="md:hidden btn-icon" title="History">
          <icon-history class="w-6 h-6"></icon-history>
        </a>

        @if (hasMessages) {
          <button (click)="clearChat.emit()" class="btn-icon" title="Clear Chat">
            <icon-trash class="w-6 h-6"></icon-trash>
          </button>
        }

        <button (click)="toggleDarkMode()" class="btn-icon" title="Toggle Theme">
          @if (settingsService.isDarkMode$ | async) {
            <icon-sun class="w-6 h-6"></icon-sun>
          } @else {
            <icon-moon class="w-6 h-6"></icon-moon>
          }
        </button>

        <button (click)="openSettings.emit()" class="btn-icon" title="Settings">
          <icon-settings class="w-6 h-6"></icon-settings>
        </button>
      </div>
    </header>
  `,
})
export class NavbarComponent {
  appTitle = APP_METADATA.name;
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
