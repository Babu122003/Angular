import { Component } from '@angular/core';
import { GeminiService, Message } from '../../services/gemini/gemini.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  userInput = '';
  messages: Message[] = [];
  isLoading = false;
  error: string | null = null;
  chatHistory: Message[][] = [];
  showHistoryPanel = false;

  constructor(private geminiService: GeminiService) {
    this.geminiService.messages$.subscribe(messages => this.messages = messages);
    this.geminiService.isLoading$.subscribe(loading => this.isLoading = loading);
    this.geminiService.error$.subscribe(error => this.error = error);
    this.loadChatHistory();
  }

  get isSendDisabled(): boolean {
    return !this.userInput.trim() || this.isLoading;
  }

  async sendMessage(): Promise<void> {
    const message = this.userInput.trim();
    if (message && !this.isLoading) {
      this.userInput = '';
      await this.geminiService.sendMessage(message);
    }
  }

  handleKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  startNewChat(): void {
    if (this.messages.length > 0) {
      this.chatHistory.push([...this.messages]);
      this.saveChatHistory();
    }
    this.geminiService.clearChat();
  }

  toggleHistory(): void {
    this.showHistoryPanel = !this.showHistoryPanel;
  }

  loadChat(index: number): void {
    const chat = this.chatHistory[index];
    this.messages = [...chat];
    this.showHistoryPanel = false;
  }

  private saveChatHistory(): void {
    localStorage.setItem('chatHistory', JSON.stringify(this.chatHistory));
  }

  private loadChatHistory(): void {
    const saved = localStorage.getItem('chatHistory');
    if (saved) {
      this.chatHistory = JSON.parse(saved);
    }
  }
}
