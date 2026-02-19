import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private apiKey = environment.geminiApiKey;
  private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  
  // BehaviorSubjects for reactive state management
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string | null>(null);
  
  messages$ = this.messagesSubject.asObservable();
  isLoading$ = this.isLoadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();

  
  async sendMessage(userMessage: string, imageData?: string): Promise<void> {
    if (!this.apiKey) {
      this.errorSubject.next('Please configure your Gemini API key in the environment file');
      return;
    }

    // Add user message to the chat
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage || '[Image]',
      timestamp: new Date() 
    };
    
    this.messagesSubject.next([...this.messagesSubject.value, newUserMessage]);
    this.isLoadingSubject.next(true);
    this.errorSubject.next(null);

    try {
      const parts: any[] = [];
      
      if (userMessage) {
        parts.push({ text: userMessage });
      }
      
      if (imageData) {
        parts.push({
          inline_data: {
            mime_type: 'image/jpeg',
            data: imageData
          }
        });
      }

      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{ parts }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to get response from Gemini');
      }

      const data = await response.json();
      
      // Add assistant's response to the chat
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.candidates[0].content.parts[0].text,
        timestamp: new Date()
      };
      
      this.messagesSubject.next([...this.messagesSubject.value, assistantMessage]);
    } catch (error) {
      this.errorSubject.next(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      this.isLoadingSubject.next(false);
    }
  }

  clearChat(): void {
    this.messagesSubject.next([]);
    this.errorSubject.next(null);
  }

  loadMessages(messages: Message[]): void {
    this.messagesSubject.next(messages);
  }
}
