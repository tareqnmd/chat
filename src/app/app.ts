import { Component } from '@angular/core';
import { ChatContainerComponent } from './components/chat-container/chat-container.component';

@Component({
  selector: 'app-root',
  imports: [ChatContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
