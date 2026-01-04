import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChatState, Message } from '../models/message.model';
import { OpenaiService } from './openai.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private chatStateSubject = new BehaviorSubject<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

  public chatState$: Observable<ChatState> = this.chatStateSubject.asObservable();

  constructor(private openaiService: OpenaiService) {
    this.loadMessagesFromStorage();
  }

  private loadMessagesFromStorage(): void {
    const stored = localStorage.getItem('chat-messages');
    if (stored) {
      try {
        const messages = JSON.parse(stored);
        // Convert timestamp strings back to Date objects
        const parsedMessages = messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        this.chatStateSubject.next({
          ...this.chatStateSubject.value,
          messages: parsedMessages,
        });
      } catch (e) {
        console.error('Failed to load messages from storage', e);
      }
    }
  }

  private saveMessagesToStorage(): void {
    const messages = this.chatStateSubject.value.messages;
    localStorage.setItem('chat-messages', JSON.stringify(messages));
  }

  addMessage(content: string, role: 'user' | 'assistant'): void {
    const message: Message = {
      id: this.generateId(),
      content,
      role,
      timestamp: new Date(),
    };

    const currentState = this.chatStateSubject.value;
    this.chatStateSubject.next({
      ...currentState,
      messages: [...currentState.messages, message],
    });

    this.saveMessagesToStorage();
  }

  async sendUserMessage(content: string): Promise<void> {
    // Add user message
    this.addMessage(content, 'user');

    // Set loading state
    this.chatStateSubject.next({
      ...this.chatStateSubject.value,
      isLoading: true,
      error: null,
    });

    try {
      // Prepare messages for OpenAI
      const messages = this.chatStateSubject.value.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Add typing indicator
      const typingMessage: Message = {
        id: 'typing',
        content: '',
        role: 'assistant',
        timestamp: new Date(),
        isTyping: true,
      };

      this.chatStateSubject.next({
        ...this.chatStateSubject.value,
        messages: [...this.chatStateSubject.value.messages, typingMessage],
      });

      // Get response from OpenAI with streaming
      let fullResponse = '';
      await this.openaiService.sendMessageStream(messages, (chunk) => {
        fullResponse += chunk;

        // Update the typing message with accumulated content
        const currentMessages = this.chatStateSubject.value.messages;
        const updatedMessages = currentMessages.map((msg) =>
          msg.id === 'typing' ? { ...msg, content: fullResponse } : msg,
        );

        this.chatStateSubject.next({
          ...this.chatStateSubject.value,
          messages: updatedMessages,
        });
      });

      // Remove typing indicator and add final message
      const messagesWithoutTyping = this.chatStateSubject.value.messages.filter(
        (msg) => msg.id !== 'typing',
      );

      const finalMessage: Message = {
        id: this.generateId(),
        content: fullResponse,
        role: 'assistant',
        timestamp: new Date(),
      };

      this.chatStateSubject.next({
        messages: [...messagesWithoutTyping, finalMessage],
        isLoading: false,
        error: null,
      });

      this.saveMessagesToStorage();
    } catch (error: any) {
      // Remove typing indicator
      const messagesWithoutTyping = this.chatStateSubject.value.messages.filter(
        (msg) => msg.id !== 'typing',
      );

      this.chatStateSubject.next({
        messages: messagesWithoutTyping,
        isLoading: false,
        error: error.message || 'Failed to send message',
      });
    }
  }

  clearMessages(): void {
    this.chatStateSubject.next({
      messages: [],
      isLoading: false,
      error: null,
    });
    localStorage.removeItem('chat-messages');
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
