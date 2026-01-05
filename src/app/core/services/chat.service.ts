import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ChatSession, ChatState, Message, MessageRole } from '../models/message.model';
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

  private isInitializedSubject = new BehaviorSubject<boolean>(false);
  public isInitialized$ = this.isInitializedSubject.asObservable();

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
    isInitialLoading: true,
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
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Storage initialization timed out')), 5000),
    );

    try {
      await Promise.race([this.storageService.init(), timeout]);
      await this.loadSessionsFromStorage();
    } catch (error) {
      console.error('Storage initialization failed or timed out', error);
      this.isInitializedSubject.next(true);
      this.chatStateSubject.next({
        ...this.chatStateSubject.value,
        isInitialLoading: false,
        error: 'Failed to initialize storage. Please refresh.',
      });
    }
  }

  private async loadSessionsFromStorage(): Promise<void> {
    try {
      const storedSessions = localStorage.getItem('chat-sessions');

      if (storedSessions) {
        try {
          const parsedSessions: Record<string, ChatSession> = JSON.parse(storedSessions);

          for (const session of Object.values(parsedSessions)) {
            await this.storageService.setItem(session.id, session);
          }
          localStorage.removeItem('chat-sessions');
        } catch (e) {
          console.error('Failed to migrate sessions from localStorage', e);
        }
      }

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

      const allSessions = await this.storageService.getAll();
      const sessionsRecord: Record<string, ChatSession> = {};

      allSessions.forEach((session) => {
        session.messages.forEach((msg: any) => {
          if (typeof msg.timestamp === 'string' || typeof msg.timestamp === 'number') {
            msg.timestamp = new Date(msg.timestamp);
          }
        });
        sessionsRecord[session.id] = session;
      });

      this.sessionsSubject.next(sessionsRecord);
      this.isInitializedSubject.next(true);

      const currentActiveId = this.activeSessionIdSubject.value;
      if (currentActiveId && sessionsRecord[currentActiveId]) {
        this.activateSession(currentActiveId);
      } else if (currentActiveId && !sessionsRecord[currentActiveId]) {
        this.chatStateSubject.next({
          ...this.chatStateSubject.value,
          isInitialLoading: false,
          error: 'Chat not found',
        });
      } else {
        this.chatStateSubject.next({
          ...this.chatStateSubject.value,
          isInitialLoading: false,
        });
      }
    } catch (error: any) {
      console.error('Initialization failed', error);
      this.isInitializedSubject.next(true);
      this.chatStateSubject.next({
        ...this.chatStateSubject.value,
        isInitialLoading: false,
        error: 'Failed to load chat history. Please refresh.',
      });
    }
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
    const isInitialized = this.isInitializedSubject.value;

    if (!isInitialized) {
      this.activeSessionIdSubject.next(id);
      return;
    }

    const sessions = this.sessionsSubject.value;
    if (sessions[id]) {
      const isAlreadyActive = this.activeSessionIdSubject.value === id;
      const isInitialLoading = this.chatStateSubject.value.isInitialLoading;

      this.activeSessionIdSubject.next(id);

      if (!isAlreadyActive || isInitialLoading) {
        this.chatStateSubject.next({
          messages: sessions[id].messages,
          isLoading: false,
          isInitialLoading: false,
          error: null,
        });
      }
    } else {
      this.activeSessionIdSubject.next(null);
      this.chatStateSubject.next({
        messages: [],
        isLoading: false,
        isInitialLoading: false,
        error: 'Chat not found',
      });
    }
  }

  deactivateSession(): void {
    this.activeSessionIdSubject.next(null);
    this.chatStateSubject.next({
      messages: [],
      isLoading: false,
      isInitialLoading: false,
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
        isInitialLoading: false,
        error: null,
      });
    }
  }

  async sendUserMessage(content: string): Promise<void> {
    const activeId = this.activeSessionIdSubject.value;
    if (!activeId) return;

    const userMessage: Message = {
      id: this.generateId(),
      content,
      role: MessageRole.USER,
      timestamp: new Date(),
    };

    const sessions = { ...this.sessionsSubject.value };
    if (sessions[activeId]) {
      sessions[activeId] = {
        ...sessions[activeId],
        messages: [...sessions[activeId].messages, userMessage],
        updatedAt: Date.now(),
      };
      this.sessionsSubject.next(sessions);

      this.chatStateSubject.next({
        messages: sessions[activeId].messages,
        isLoading: false,
        isInitialLoading: false,
        error: null,
      });
    }

    this.saveSession(sessions[activeId]);

    const session = sessions[activeId];
    if (session.messages.length === 1) {
      await this.updateSessionTitle(
        activeId,
        content.slice(0, 30) + (content.length > 30 ? '...' : ''),
      );
    }

    const typingId = 'typing';
    const typingMessage: Message = {
      id: typingId,
      content: '',
      role: MessageRole.ASSISTANT,
      timestamp: new Date(),
      isTyping: true,
    };

    this.chatStateSubject.next({
      messages: [...session.messages, typingMessage],
      isLoading: true,
      isInitialLoading: false,
      error: null,
    });

    try {
      const apiMessages = session.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

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
        role: MessageRole.ASSISTANT,
        timestamp: new Date(),
      });

      const finalSession = this.sessionsSubject.value[activeId];
      this.chatStateSubject.next({
        messages: finalSession ? finalSession.messages : [],
        isLoading: false,
        isInitialLoading: false,
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
          isInitialLoading: false,
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
        isInitialLoading: false,
        error: null,
      });
    }
  }

  private generateId(): string {
    return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  }
}
