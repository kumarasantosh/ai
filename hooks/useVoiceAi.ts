import { useState, useCallback, useRef, useEffect } from "react";

export interface VoiceAIConfig {
  serverUrl: string;
  apiKey?: string;
}

export interface ConversationMessage {
  id: string;
  type: "user" | "ai" | "system";
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

export interface VoiceAIState {
  isConnected: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  conversationId: string | null;
  messages: ConversationMessage[];
  error: string | null;
  connectionStatus: "disconnected" | "connecting" | "connected" | "error";
}

export const useVoiceAI = (config: VoiceAIConfig) => {
  const [state, setState] = useState<VoiceAIState>({
    isConnected: false,
    isRecording: false,
    isProcessing: false,
    conversationId: null,
    messages: [],
    error: null,
    connectionStatus: "disconnected",
  });

  const websocketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Generate unique conversation ID
  const generateConversationId = useCallback(() => {
    return `conv_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;
  }, []);

  // Add message to conversation
  const addMessage = useCallback(
    (message: Omit<ConversationMessage, "id" | "timestamp">) => {
      const newMessage: ConversationMessage = {
        ...message,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, newMessage],
      }));

      return newMessage;
    },
    []
  );

  // Connect to voice AI server
  const connect = useCallback(async () => {
    try {
      setState((prev) => ({
        ...prev,
        connectionStatus: "connecting",
        error: null,
      }));

      const conversationId = generateConversationId();
      const wsUrl = `${config.serverUrl.replace(
        "http",
        "ws"
      )}/ws/voice/${conversationId}`;

      const websocket = new WebSocket(wsUrl);
      websocketRef.current = websocket;

      return new Promise<void>((resolve, reject) => {
        websocket.onopen = () => {
          setState((prev) => ({
            ...prev,
            isConnected: true,
            connectionStatus: "connected",
            conversationId,
            error: null,
          }));

          addMessage({
            type: "system",
            content: "Connected to Voice AI",
          });

          resolve();
        };

        websocket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            handleServerMessage(message);
          } catch (error) {
            console.error("Error parsing server message:", error);
          }
        };

        websocket.onclose = () => {
          setState((prev) => ({
            ...prev,
            isConnected: false,
            connectionStatus: "disconnected",
            isRecording: false,
            isProcessing: false,
          }));

          addMessage({
            type: "system",
            content: "Disconnected from Voice AI",
          });
        };

        websocket.onerror = (error) => {
          setState((prev) => ({
            ...prev,
            connectionStatus: "error",
            error: "WebSocket connection failed",
          }));
          reject(error);
        };
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        connectionStatus: "error",
        error: error instanceof Error ? error.message : "Connection failed",
      }));
      throw error;
    }
  }, [config.serverUrl, generateConversationId, addMessage]);

  // Handle messages from server
  const handleServerMessage = useCallback(
    (message: any) => {
      switch (message.type) {
        case "connection_established":
          console.log("Connection established:", message.conversation_id);
          break;

        case "conversation_started":
          setState((prev) => ({ ...prev, isProcessing: true }));
          addMessage({
            type: "system",
            content: "Conversation started - You can speak now!",
          });
          break;

        case "conversation_ended":
          setState((prev) => ({
            ...prev,
            isProcessing: false,
            isRecording: false,
          }));
          addMessage({
            type: "system",
            content: "Conversation ended",
          });
          break;

        case "transcript_user":
          addMessage({
            type: "user",
            content: message.text,
          });
          break;

        case "transcript_ai":
          addMessage({
            type: "ai",
            content: message.text,
          });
          break;

        case "audio_response":
          // Handle AI audio response
          if (message.audio_data) {
            playAudioResponse(message.audio_data);
          }
          setState((prev) => ({ ...prev, isProcessing: false }));
          break;

        case "processing_start":
          setState((prev) => ({ ...prev, isProcessing: true }));
          break;

        case "processing_end":
          setState((prev) => ({ ...prev, isProcessing: false }));
          break;

        case "error":
          setState((prev) => ({ ...prev, error: message.message }));
          addMessage({
            type: "system",
            content: `Error: ${message.message}`,
          });
          break;

        default:
          console.log("Unknown message type:", message);
      }
    },
    [addMessage]
  );

  // Play audio response from AI
  const playAudioResponse = useCallback(async (audioData: string) => {
    try {
      // Convert base64 audio data to blob
      const audioBlob = new Blob(
        [Uint8Array.from(atob(audioData), (c) => c.charCodeAt(0))],
        { type: "audio/mpeg" }
      );

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      await audio.play();

      // Cleanup URL after playing
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };
    } catch (error) {
      console.error("Error playing audio response:", error);
    }
  }, []);

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = stream;

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (
          event.data.size > 0 &&
          websocketRef.current?.readyState === WebSocket.OPEN
        ) {
          // Send audio data to server
          websocketRef.current.send(event.data);
        }
      };

      // Start recording with small chunks for real-time processing
      mediaRecorder.start(250); // 250ms chunks

      setState((prev) => ({ ...prev, isRecording: true }));

      // Send start conversation message
      if (websocketRef.current?.readyState === WebSocket.OPEN) {
        websocketRef.current.send(
          JSON.stringify({
            type: "start_conversation",
          })
        );
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : "Failed to start recording",
      }));
      throw error;
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(async () => {
    try {
      if (mediaRecorderRef.current && state.isRecording) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      setState((prev) => ({ ...prev, isRecording: false }));

      // Send stop conversation message
      if (websocketRef.current?.readyState === WebSocket.OPEN) {
        websocketRef.current.send(
          JSON.stringify({
            type: "end_conversation",
          })
        );
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  }, [state.isRecording]);

  // Disconnect from server
  const disconnect = useCallback(() => {
    if (state.isRecording) {
      stopRecording();
    }

    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isConnected: false,
      connectionStatus: "disconnected",
      conversationId: null,
      isRecording: false,
      isProcessing: false,
    }));
  }, [state.isRecording, stopRecording]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setState((prev) => ({ ...prev, messages: [] }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    startRecording,
    stopRecording,
    clearMessages,
    addMessage,
  };
};
