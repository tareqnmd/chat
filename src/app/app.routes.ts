import { Routes } from '@angular/router';
import { ChatContainerComponent } from './components/chat-container/chat-container.component';
import { HistoryComponent } from './components/history/history.component';

export const routes: Routes = [
  { path: '', redirectTo: 'chat/new', pathMatch: 'full' },
  { path: 'chat/:id', component: ChatContainerComponent },
  { path: 'history', component: HistoryComponent },
];
