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
  selectedImage: string | null = null;
  selectedImageData: string | null = null;
  currentChatIndex: number | null = null;

  constructor(private geminiService: GeminiService) {
    this.geminiService.messages$.subscribe(messages => this.messages = messages);
    this.geminiService.isLoading$.subscribe(loading => this.isLoading = loading);
    this.geminiService.error$.subscribe(error => this.error = error);
    this.loadChatHistory();
  }

  get isSendDisabled(): boolean {
    return (!this.userInput.trim() && !this.selectedImage) || this.isLoading;
  }

  async sendMessage(): Promise<void> {
    const message = this.userInput.trim();
    if ((message || this.selectedImage) && !this.isLoading) {
      this.userInput = '';
      await this.geminiService.sendMessage(message, this.selectedImageData || undefined);
      this.removeImage();
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
      if (this.currentChatIndex !== null) {
        this.chatHistory[this.currentChatIndex] = [...this.messages];
      } else {
        this.chatHistory.unshift([...this.messages]);
      }
      this.saveChatHistory();
    }
    this.currentChatIndex = null;
    this.geminiService.clearChat();
  }

  toggleHistory(): void {
    this.showHistoryPanel = !this.showHistoryPanel;
  }

  loadChat(index: number): void {
    const chat = this.chatHistory[index];
    this.currentChatIndex = index;
    this.geminiService.loadMessages([...chat]);
    this.showHistoryPanel = false;
  }

  deleteChat(index: number): void {
    this.chatHistory.splice(index, 1);
    this.saveChatHistory();
    //updated
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target.result;
        this.selectedImageData = e.target.result.split(',')[1];
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedImage = null;
    this.selectedImageData = null;
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
