import { VoiceAIConfig } from '../hooks/useVoiceAI';


export class VoiceAIClient {
  private config: VoiceAIConfig;
  private websocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  constructor(config: VoiceAIConfig) {
    this.config = config;
  }

  async connect(): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      try {
        const conversationId = this.generateConversationId();
        const wsUrl = `${this.config.serverUrl.replace('http', 'ws')}/ws/voice/${conversationId}`;
        
        this.websocket = new WebSocket(wsUrl);

        this.websocket.onopen = () => {
          this.reconnectAttempts = 0;
          resolve(this.websocket!);
        };

        this.websocket.onerror = (error) => {
          reject(error);
        };

        this.websocket.onclose = () => {
          this.handleDisconnect();
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  private handleDisconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect().catch(console.error);
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  private generateConversationId(): string {
    return `conv_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
  }

  disconnect() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }
}