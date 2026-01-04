import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { NgxSonnerToaster, toast } from 'ngx-sonner';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SettingsModalComponent } from './components/settings-modal/settings-modal.component';
import { ClearChatToastComponent } from './components/shared/clear-chat-toast.component';
import { ChatService } from './core/services/chat.service';
import { MetaService } from './core/services/meta.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    NavbarComponent,
    SettingsModalComponent,
    NgxSonnerToaster,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  showSettings = false;
  hasMessages = false;

  constructor(
    private chatService: ChatService,
    private router: Router,
    private metaService: MetaService,
  ) {}

  ngOnInit(): void {
    this.metaService.initDefaultMeta();
    this.chatService.chatState$.subscribe((state) => {
      this.hasMessages = state.messages.length > 0;
    });
  }

  onNewChat(): void {
    this.router.navigate(['/']);
  }

  clearChat(): void {
    toast(ClearChatToastComponent, { duration: Infinity });
  }
}
