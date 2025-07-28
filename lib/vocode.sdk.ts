// lib/vocode.sdk.ts
export class VocodeClient {
  private ws: WebSocket | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private sessionId: string | null = null;
  private isMuted: boolean = false;
  private eventListeners: { [key: string]: Function[] } = {};
  private isConnected: boolean = false;
  private audioQueue: Uint8Array[] = [];
  private isPlaying: boolean = false;

  constructor(private baseUrl: string = "ws://13.61.23.14:8000/") {}

  // Event listener management
  on(event: string, callback: Function) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(
        (cb) => cb !== callback
      );
    }
  }

  private emit(event: string, data?: any) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach((callback) => callback(data));
    }
  }

  // Start a voice conversation
  async start(assistantConfig: any, assistantOverrides: any = {}) {
    try {
      // First, initialize the call
      const response = await fetch(
        `${this.baseUrl.replace("ws:", "http:")}/start-call`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            agent_config: {
              subject:
                assistantOverrides.variableValues?.subject ||
                assistantConfig.name,
              content: assistantOverrides.variableValues?.content || "",
              style:
                assistantOverrides.variableValues?.style || "conversational",
              voice: assistantConfig.voice || "alloy",
              topic: assistantConfig.topic || "general",
              prompt: assistantConfig.firstMessage || null,
            },
            session_id: `session_${Date.now()}`,
          }),
        }
      );

      const callData = await response.json();
      this.sessionId = callData.session_id;

      // Connect WebSocket
      await this.connectWebSocket();

      // Start audio recording
      await this.startAudioRecording();

      this.emit("call-start");
    } catch (error) {
      this.emit("error", error);
      throw error;
    }
  }

  // Connect WebSocket for real-time communication
  private async connectWebSocket(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`${this.baseUrl}/ws/${this.sessionId}`);

      this.ws.onopen = () => {
        console.log("WebSocket connected");
        this.isConnected = true;

        // Send initial configuration
        this.ws?.send(
          JSON.stringify({
            agent_config: {
              subject: "AI Companion",
              content: "",
              style: "conversational",
              voice: "alloy",
              topic: "general",
            },
          })
        );

        resolve();
      };

      this.ws.onmessage = async (event) => {
        if (typeof event.data === "string") {
          const message = JSON.parse(event.data);
          this.handleTextMessage(message);
        } else {
          // Handle binary audio data
          await this.handleAudioData(event.data);
        }
      };

      this.ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.emit("error", error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log("WebSocket closed");
        this.isConnected = false;
        this.emit("call-end");
      };
    });
  }

  // Handle text messages from WebSocket
  private handleTextMessage(message: any) {
    switch (message.type) {
      case "call-start":
        console.log("Call started");
        break;
      case "transcript":
        this.emit("message", {
          type: "transcript",
          transcriptType: "final",
          transcript: message.content,
          role: message.role,
        });
        break;
      case "speech-start":
        this.emit("speech-start");
        break;
      case "speech-end":
        this.emit("speech-end");
        break;
      case "call-end":
        this.emit("call-end");
        break;
      case "error":
        this.emit("error", new Error(message.message));
        break;
    }
  }

  // Handle incoming audio data
  private async handleAudioData(audioData: ArrayBuffer) {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }

      // Convert incoming audio to playable format
      const audioBuffer = await this.audioContext.decodeAudioData(audioData);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.start();
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  }

  // Start recording user's audio
  private async startAudioRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (
          event.data.size > 0 &&
          this.ws &&
          this.ws.readyState === WebSocket.OPEN &&
          !this.isMuted
        ) {
          // Convert to ArrayBuffer and send
          event.data.arrayBuffer().then((buffer) => {
            this.ws?.send(buffer);
          });
        }
      };

      this.mediaRecorder.start(100); // Send data every 100ms
    } catch (error) {
      console.error("Error starting audio recording:", error);
      this.emit("error", error);
    }
  }

  // Stop the conversation
  stop() {
    try {
      // Stop media recorder
      if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
        this.mediaRecorder.stop();
        this.mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      }

      // Close WebSocket
      if (this.ws) {
        this.ws.send(JSON.stringify({ type: "end-call" }));
        this.ws.close();
      }

      // Clean up audio context
      if (this.audioContext) {
        this.audioContext.close();
        this.audioContext = null;
      }

      this.isConnected = false;
      this.sessionId = null;
      this.emit("call-end");
    } catch (error) {
      console.error("Error stopping call:", error);
      this.emit("error", error);
    }
  }

  // Mute/unmute functionality
  setMuted(muted: boolean) {
    this.isMuted = muted;

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: muted ? "mute" : "unmute",
        })
      );
    }
  }

  isMuted(): boolean {
    return this.isMuted;
  }

  // Check if currently connected
  isActive(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }
}

// Create singleton instance (similar to your vapi usage)
export const vocode = new VocodeClient();

// lib/utils.ts - Add this to your existing utils
export const configureAssistant = (
  voice: string,
  style: string,
  unit: any,
  topic: string
) => {
  return {
    name: `${unit.title} Companion`,
    voice: voice,
    topic: topic,
    firstMessage: `Hello! I'm here to help you learn about ${topic}. What would you like to explore?`,
    model: {
      provider: "openai",
      model: "gpt-4",
      temperature: 0.7,
      maxTokens: 150,
    },
    transcriber: {
      provider: "deepgram",
      model: "nova-2",
      language: "en-US",
    },
    synthesizer: {
      provider: "elevenlabs",
      voice: voice,
    },
  };
};
