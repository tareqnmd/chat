import { Routes } from '@angular/router';
import { ChatContainerComponent } from './components/chat-container/chat-container.component';
import { HistoryComponent } from './components/history/history.component';

export const routes: Routes = [
  { path: '', component: ChatContainerComponent },
  { path: 'chat/:id', component: ChatContainerComponent },
  { path: 'history', component: HistoryComponent },
];
