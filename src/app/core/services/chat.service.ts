import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChatSession, ChatState, Message } from '../models/message.model';
import { OpenaiService } from './openai.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private sessionsSubject = new BehaviorSubject<Record<string, ChatSession>>({});
  public sessions$ = this.sessionsSubject.asObservable();

  private activeSessionIdSubject = new BehaviorSubject<string | null>(null);
  public activeSessionId$ = this.activeSessionIdSubject.asObservable();

  private chatStateSubject = new BehaviorSubject<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });
  public chatState$ = this.chatStateSubject.asObservable();

  constructor(private openaiService: OpenaiService) {
    this.loadSessionsFromStorage();
  }

  private loadSessionsFromStorage(): void {
    const storedSessions = localStorage.getItem('chat-sessions');
    let sessions: Record<string, ChatSession> = {};

    if (storedSessions) {
      try {
        sessions = JSON.parse(storedSessions);
        Object.values(sessions).forEach((session) => {
          session.messages.forEach((msg) => (msg.timestamp = new Date(msg.timestamp)));
        });
      } catch (e) {
        console.error('Failed to parse sessions', e);
      }
    }

    const legacyMessages = localStorage.getItem('chat-messages');
    if (legacyMessages && Object.keys(sessions).length === 0) {
      try {
        const messages = JSON.parse(legacyMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        if (messages.length > 0) {
          const newId = this.generateId();
          sessions[newId] = {
            id: newId,
            title: 'Migrated Chat',
            messages,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          localStorage.removeItem('chat-messages');
        }
      } catch (e) {
        console.error('Failed to migrate legacy messages', e);
      }
    }

    this.sessionsSubject.next(sessions);
  }

  private saveSessions(): void {
    localStorage.setItem('chat-sessions', JSON.stringify(this.sessionsSubject.value));
  }

  createSession(): string {
    const id = this.generateId();
    const newSession: ChatSession = {
      id,
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const sessions = { ...this.sessionsSubject.value, [id]: newSession };
    this.sessionsSubject.next(sessions);
    this.saveSessions();

    this.activateSession(id);
    return id;
  }

  activateSession(id: string): void {
    const sessions = this.sessionsSubject.value;
    if (sessions[id]) {
      this.activeSessionIdSubject.next(id);
      this.chatStateSubject.next({
        messages: sessions[id].messages,
        isLoading: false,
        error: null,
      });
    } else {
      this.activeSessionIdSubject.next(null);
      this.chatStateSubject.next({
        messages: [],
        isLoading: false,
        error: 'Chat not found',
      });
    }
  }

  deleteSession(id: string): void {
    const sessions = { ...this.sessionsSubject.value };
    delete sessions[id];
    this.sessionsSubject.next(sessions);
    this.saveSessions();

    if (this.activeSessionIdSubject.value === id) {
      this.activeSessionIdSubject.next(null);
      this.chatStateSubject.next({
        messages: [],
        isLoading: false,
        error: null,
      });
    }
  }

  async sendUserMessage(content: string): Promise<void> {
    const activeId = this.activeSessionIdSubject.value;
    if (!activeId) return;

    this.addMessageToSession(activeId, {
      id: this.generateId(),
      content,
      role: 'user',
      timestamp: new Date(),
    });

    const session = this.sessionsSubject.value[activeId];
    if (session.messages.length === 1) {
      this.updateSessionTitle(activeId, content.slice(0, 30) + (content.length > 30 ? '...' : ''));
    }

    this.chatStateSubject.next({
      ...this.chatStateSubject.value,
      isLoading: true,
      error: null,
    });

    try {
      const apiMessages = session.messages
        .map((msg) => ({
          role: (msg as any).role === 'typing' ? 'assistant' : msg.role,
          content: msg.content,
        }))
        .filter((m) => (m as any).role !== 'typing');

      const typingId = 'typing';
      const typingMessage: Message = {
        id: typingId,
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        isTyping: true,
      };

      const currentMessages = this.chatStateSubject.value.messages;
      this.chatStateSubject.next({
        ...this.chatStateSubject.value,
        messages: [...currentMessages, typingMessage],
      });

      let fullResponse = '';
      await this.openaiService.sendMessageStream(apiMessages as any, (chunk) => {
        fullResponse += chunk;

        const updatedMsgs = this.chatStateSubject.value.messages.map((m) =>
          m.id === typingId ? { ...m, content: fullResponse } : m,
        );
        this.chatStateSubject.next({
          ...this.chatStateSubject.value,
          messages: updatedMsgs,
        });
      });

      this.addMessageToSession(activeId, {
        id: this.generateId(),
        content: fullResponse,
        role: 'assistant',
        timestamp: new Date(),
      });

      this.chatStateSubject.next({
        messages: this.sessionsSubject.value[activeId].messages,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      this.chatStateSubject.next({
        ...this.chatStateSubject.value,
        isLoading: false,
        error: error.message || 'Failed to generate response',
      });
    }
  }

  private addMessageToSession(sessionId: string, message: Message): void {
    const sessions = { ...this.sessionsSubject.value };
    if (sessions[sessionId]) {
      sessions[sessionId] = {
        ...sessions[sessionId],
        messages: [...sessions[sessionId].messages, message],
        updatedAt: Date.now(),
      };
      this.sessionsSubject.next(sessions);
      this.saveSessions();

      if (this.activeSessionIdSubject.value === sessionId) {
        this.chatStateSubject.next({
          messages: sessions[sessionId].messages,
          isLoading: this.chatStateSubject.value.isLoading,
          error: this.chatStateSubject.value.error,
        });
      }
    }
  }

  updateSessionTitle(sessionId: string, title: string): void {
    const sessions = { ...this.sessionsSubject.value };
    if (sessions[sessionId]) {
      sessions[sessionId] = { ...sessions[sessionId], title };
      this.sessionsSubject.next(sessions);
      this.saveSessions();
    }
  }

  clearMessages(): void {
    const activeId = this.activeSessionIdSubject.value;
    if (activeId) {
      const sessions = { ...this.sessionsSubject.value };
      sessions[activeId].messages = [];
      this.sessionsSubject.next(sessions);
      this.saveSessions();

      this.chatStateSubject.next({
        messages: [],
        isLoading: false,
        error: null,
      });
    }
  }

  private generateId(): string {
    return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  }
}
