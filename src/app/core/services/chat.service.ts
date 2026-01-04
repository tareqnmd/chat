import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChatSession, ChatState, Message } from '../models/message.model';
import { OpenaiService } from './openai.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private sessionsSubject = new BehaviorSubject<Record<string, ChatSession>>({});
  public sessions$ = this.sessionsSubject.asObservable();

  private activeSessionIdSubject = new BehaviorSubject<string | null>(null);
  public activeSessionId$ = this.activeSessionIdSubject.asObservable();

  private pendingDeleteIdSubject = new BehaviorSubject<string | null>(null);
  public pendingDeleteId$ = this.pendingDeleteIdSubject.asObservable();

  setPendingDeleteId(id: string | null): void {
    this.pendingDeleteIdSubject.next(id);
  }

  getPendingDeleteId(): string | null {
    return this.pendingDeleteIdSubject.value;
  }

  getActiveSessionId(): string | null {
    return this.activeSessionIdSubject.value;
  }

  private chatStateSubject = new BehaviorSubject<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });
  public chatState$ = this.chatStateSubject.asObservable();

  constructor(
    private openaiService: OpenaiService,
    private storageService: StorageService,
  ) {
    this.initStorage();
  }

  private async initStorage(): Promise<void> {
    await this.storageService.init();
    await this.loadSessionsFromStorage();
  }

  private async loadSessionsFromStorage(): Promise<void> {
    // 1. Check for legacy localStorage data
    const storedSessions = localStorage.getItem('chat-sessions');
    let sessions: Record<string, ChatSession> = {};

    if (storedSessions) {
      try {
        const parsedSessions: Record<string, ChatSession> = JSON.parse(storedSessions);
        // Migrate to IndexedDB
        for (const session of Object.values(parsedSessions)) {
          await this.storageService.setItem(session.id, session);
        }
        localStorage.removeItem('chat-sessions');
      } catch (e) {
        console.error('Failed to migrate sessions from localStorage', e);
      }
    }

    // 2. Check for even older legacy messages
    const legacyMessages = localStorage.getItem('chat-messages');
    if (legacyMessages) {
      try {
        const messages = JSON.parse(legacyMessages);
        if (messages.length > 0) {
          const newId = this.generateId();
          const migratedSession: ChatSession = {
            id: newId,
            title: 'Migrated Chat',
            messages,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          await this.storageService.setItem(newId, migratedSession);
          localStorage.removeItem('chat-messages');
        }
      } catch (e) {
        console.error('Failed to migrate legacy messages', e);
      }
    }

    // 3. Load from IndexedDB
    const allSessions = await this.storageService.getAll();
    const sessionsRecord: Record<string, ChatSession> = {};

    allSessions.forEach((session) => {
      // Ensure timestamps are Date objects if they were serialized
      session.messages.forEach((msg: any) => {
        if (typeof msg.timestamp === 'string' || typeof msg.timestamp === 'number') {
          msg.timestamp = new Date(msg.timestamp);
        }
      });
      sessionsRecord[session.id] = session;
    });

    this.sessionsSubject.next(sessionsRecord);
  }

  private async saveSession(session: ChatSession): Promise<void> {
    await this.storageService.setItem(session.id, session);
  }

  async createSession(): Promise<string> {
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
    await this.saveSession(newSession);

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

  deactivateSession(): void {
    this.activeSessionIdSubject.next(null);
    this.chatStateSubject.next({
      messages: [],
      isLoading: false,
      error: null,
    });
  }

  async deleteSession(id: string): Promise<void> {
    const sessions = { ...this.sessionsSubject.value };
    delete sessions[id];
    this.sessionsSubject.next(sessions);
    await this.storageService.removeItem(id);

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

    await this.addMessageToSession(activeId, {
      id: this.generateId(),
      content,
      role: 'user',
      timestamp: new Date(),
    });

    const session = this.sessionsSubject.value[activeId];
    if (session.messages.length === 1) {
      await this.updateSessionTitle(
        activeId,
        content.slice(0, 30) + (content.length > 30 ? '...' : ''),
      );
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

      await this.addMessageToSession(activeId, {
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

  private async addMessageToSession(sessionId: string, message: Message): Promise<void> {
    const sessions = { ...this.sessionsSubject.value };
    if (sessions[sessionId]) {
      sessions[sessionId] = {
        ...sessions[sessionId],
        messages: [...sessions[sessionId].messages, message],
        updatedAt: Date.now(),
      };
      this.sessionsSubject.next(sessions);
      await this.saveSession(sessions[sessionId]);

      if (this.activeSessionIdSubject.value === sessionId) {
        this.chatStateSubject.next({
          messages: sessions[sessionId].messages,
          isLoading: this.chatStateSubject.value.isLoading,
          error: this.chatStateSubject.value.error,
        });
      }
    }
  }

  async updateSessionTitle(sessionId: string, title: string): Promise<void> {
    const sessions = { ...this.sessionsSubject.value };
    if (sessions[sessionId]) {
      sessions[sessionId] = { ...sessions[sessionId], title };
      this.sessionsSubject.next(sessions);
      await this.saveSession(sessions[sessionId]);
    }
  }

  async clearMessages(): Promise<void> {
    const activeId = this.activeSessionIdSubject.value;
    if (activeId) {
      const sessions = { ...this.sessionsSubject.value };
      sessions[activeId].messages = [];
      this.sessionsSubject.next(sessions);
      await this.saveSession(sessions[activeId]);

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
