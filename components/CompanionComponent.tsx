"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import soundwaves from "@/constants/soundwaves.json";
import { addToSessionHistory } from "@/lib/action/companion.action";
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  AlertCircle,
  Volume2,
  Mic,
  MicOff,
  MessageSquare,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
  ERROR = "ERROR",
}

interface SavedMessage {
  role: "user" | "assistant" | "error";
  content: string;
  timestamp?: string;
}

interface Unit {
  id: string;
  section_id: string;
  title: string;
  content: string;
  prompt: string | null;
}

interface Section {
  id: string;
  title: string;
  description: string;
  units: Unit[];
}

interface Companion {
  id: string;
  name: string;
  subject: string;
}

interface CompanionComponentProps {
  name: string;
  subject: string;
  companionId: string;
  userImage?: string;
  style?: string;
  voice?: string;
  title?: string;
  topic?: string;
  duration?: number;
  color?: string;
  userName?: string;
  unit: Unit | Unit[]; // Fixed: Handle both single unit and array
  companion: Companion;
  sections: Section[];
}

interface VoiceOption {
  id: string;
  name: string;
  language: string;
  gender: string;
  description: string;
  voice_name?: string;
  sample_rate?: string;
  quality?: string;
}

const CompanionComponent: React.FC<CompanionComponentProps> = ({
  name,
  subject,
  companionId,
  userImage,
  style,
  voice,
  title,
  topic,
  duration,
  color,
  userName,
  unit,
  companion,
  sections,
}) => {
  // State management
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedVoice, setSelectedVoice] = useState<string>(voice || "female");
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);

  // UI state
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);

  // Audio and WebSocket refs
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isRecordingRef = useRef(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const voiceDetectionActiveRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Transcript scroll ref
  const transcriptScrollRef = useRef<HTMLDivElement>(null);

  // Fixed: Use ref for muted state to avoid closure issues
  const isMutedRef = useRef(false);

  // Enhanced configuration constants for better short word detection
  const WEBSOCKET_URL =
    process.env.NEXT_PUBLIC_VOCODE_WS_URL ||
    "ws://13.60.19.253:3000/conversation";
  const VOICE_THRESHOLD = 0.06; // Reduced from 0.08 for better sensitivity
  const SILENCE_TIMEOUT = 600; // Reduced from 1000ms for faster detection
  const MAX_RETRY_ATTEMPTS = 3;
  const HEARTBEAT_INTERVAL = 30000;

  // Fixed: Normalize unit data to always be an array
  const normalizedUnit = Array.isArray(unit) ? unit[0] : unit;

  // Auto-scroll transcript to bottom when new messages arrive
  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop =
        transcriptScrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Clear transcript function
  const clearTranscript = useCallback(() => {
    setMessages([]);
  }, []);

  // Fetch available Neural2 voices
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_VOCODE_WS_URL?.replace(
            "ws://",
            "http://"
          ).replace("/conversation", "") || "http://13.60.19.253:3000";

        const response = await fetch(`${baseUrl}/voices`);
        if (response.ok) {
          const data = await response.json();
          const voiceList: VoiceOption[] = Object.values(data.voices);
          setAvailableVoices(voiceList);
          console.log("✅ Available Premium Neural2 voices loaded:", voiceList);
        }
      } catch (error) {
        console.error("❌ Failed to fetch voices:", error);
        // Enhanced fallback voices with Neural2
        setAvailableVoices([
          {
            id: "female",
            name: "Premium Female (US)",
            language: "en-US",
            gender: "female",
            description:
              "High-quality Neural2 female voice with American accent - incredibly natural",
            voice_name: "en-US-Neural2-C",
            quality: "Neural2 (Premium)",
          },
          {
            id: "male",
            name: "Premium Male (US)",
            language: "en-US",
            gender: "male",
            description:
              "High-quality Neural2 male voice with American accent - incredibly natural",
            voice_name: "en-US-Neural2-D",
            quality: "Neural2 (Premium)",
          },
          {
            id: "british",
            name: "Premium Female (UK)",
            language: "en-GB",
            gender: "female",
            description:
              "High-quality Neural2 female voice with British accent - incredibly natural",
            voice_name: "en-GB-Neural2-A",
            quality: "Neural2 (Premium)",
          },
        ]);
      }
    };
    fetchVoices();
  }, []);

  // Fixed: Update ref when state changes
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const toggleSection = useCallback(
    (id: string) => {
      setOpenSectionId(openSectionId === id ? null : id);
    },
    [openSectionId]
  );

  const handleServerMessage = useCallback((data: any) => {
    console.log("🎯 Processing server message:", data.type, data);

    switch (data.type) {
      case "connection_established":
        console.log("✅ Connection established:", data.message);
        setConnectionError(null);
        setRetryCount(0);
        break;

      case "voice_changed":
        console.log("🎤 Voice changed:", data);
        setMessages((prev) => [
          {
            role: "assistant",
            content: `Voice changed to ${data.voice_name || data.voice_id}`,
            timestamp: new Date().toISOString(),
          },
          ...prev,
        ]);
        break;

      case "context_set":
        console.log("📚 Context set:", data.message);
        break;

      case "processing_start":
        console.log("⚙️ Processing started");
        break;

      case "no_speech_detected":
        console.log("🤫 No speech detected");
        break;

      case "transcript":
        console.log("📝 Transcript:", data.text);
        setMessages((prev) => [
          {
            role: "user",
            content: data.text,
            timestamp: data.timestamp || new Date().toISOString(),
          },
          ...prev,
        ]);
        break;

      case "ai_response":
        console.log("🤖 AI Response:", data.text);
        setMessages((prev) => [
          {
            role: "assistant",
            content: data.text,
            timestamp: data.timestamp || new Date().toISOString(),
          },
          ...prev,
        ]);
        break;

      case "audio_start":
        console.log("🔊 Audio playback starting");
        setIsSpeaking(true);
        break;

      case "audio_end":
        console.log("🔇 Audio playback ended");
        setIsSpeaking(false);
        break;

      case "error":
        console.error("🚨 Server error:", data.message);
        setConnectionError(data.message);
        setMessages((prev) => [
          {
            role: "error",
            content: `Error: ${data.message}`,
            timestamp: new Date().toISOString(),
          },
          ...prev,
        ]);
        if (!data.message.toLowerCase().includes("audio")) {
          setCallStatus(CallStatus.ERROR);
        }
        break;

      case "pong":
        console.log("🏓 Pong received - connection alive");
        break;

      default:
        console.log("❓ Unknown message type:", data.type, data);
    }
  }, []);

  const playAudioResponse = useCallback(async (audioBlob: Blob) => {
    try {
      console.log(
        "🎵 Playing Premium Neural2 audio response:",
        audioBlob.size,
        "bytes"
      );

      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      // Enhanced audio settings for Neural2 quality
      audio.volume = 1.0; // Maximum volume for Neural2 voices
      audio.preload = "auto";

      // Apply audio enhancements if supported
      if (audio.audioTracks && audio.audioTracks.length > 0) {
        audio.audioTracks[0].enabled = true;
      }

      audio.onplay = () => {
        console.log("🔊 Premium Neural2 audio started playing");
        setIsSpeaking(true);
      };

      audio.onended = () => {
        console.log("🔇 Premium Neural2 audio finished playing");
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
      };

      audio.onerror = (error) => {
        console.error("🚫 Audio playback error:", error);
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
      };

      // Enhanced playback with better error handling
      try {
        await audio.play();
      } catch (playError) {
        console.error("🚫 Audio play failed:", playError);

        // Fallback: try with slightly lower volume
        audio.volume = 0.9;
        try {
          await audio.play();
        } catch (fallbackError) {
          console.error("🚫 Audio fallback also failed:", fallbackError);
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          currentAudioRef.current = null;
        }
      }
    } catch (error) {
      console.error("❌ Audio playback error:", error);
      setIsSpeaking(false);
    }
  }, []);

  const initializeAudio = useCallback(async () => {
    try {
      console.log("🎙️ Initializing enhanced audio system...");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContext();

      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.8;

      const mimeTypes = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
        "audio/ogg;codecs=opus",
      ];

      let selectedMimeType = "";
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        audioBitsPerSecond: 16000,
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Updated onstop handler to check if audio should be sent
      mediaRecorderRef.current.onstop = () => {
        // Check the ref for the most current mute state
        const currentlyMuted = isMutedRef.current;

        // Only send audio if we have chunks AND we're not muted
        if (audioChunksRef.current.length > 0 && !currentlyMuted) {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: selectedMimeType,
          });
          console.log("📤 Sending audio to server:", audioBlob.size, "bytes");
          sendAudioToServer(audioBlob);
        } else if (currentlyMuted) {
          console.log("🔇 Discarding audio - microphone was muted");
        }
        audioChunksRef.current = [];
        isRecordingRef.current = false;
      };

      setTimeout(() => {
        console.log("👂 Starting enhanced voice activity detection");
        startVoiceActivityDetection();
      }, 2000);

      console.log("✅ Enhanced audio system initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize audio:", error);
      setCallStatus(CallStatus.ERROR);
      setConnectionError(
        `Audio initialization failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }, []);

  const startVoiceActivityDetection = useCallback(() => {
    if (!analyserRef.current || voiceDetectionActiveRef.current) return;

    voiceDetectionActiveRef.current = true;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let isCurrentlyListening = false;
    let consecutiveVoiceFrames = 0;
    let consecutiveSilenceFrames = 0;
    let recordingStartTime = 0;

    const detectVoice = () => {
      if (!voiceDetectionActiveRef.current || !analyserRef.current) {
        if (voiceDetectionActiveRef.current) {
          animationFrameRef.current = requestAnimationFrame(detectVoice);
        }
        return;
      }

      try {
        // CRITICAL: Check muted state from ref, not closure
        const currentlyMuted = isMutedRef.current;

        analyserRef.current.getByteFrequencyData(dataArray);
        const average =
          dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        const normalizedVolume = average / 255;

        // Check if microphone is muted - if so, skip voice detection entirely
        if (currentlyMuted) {
          // If we were listening when muted, stop immediately
          if (isCurrentlyListening) {
            console.log("🔇 Muted during recording - canceling");
            isCurrentlyListening = false;
            consecutiveVoiceFrames = 0;
            consecutiveSilenceFrames = 0;
            cancelRecording();
          }

          // Continue the detection loop but don't process audio
          if (voiceDetectionActiveRef.current) {
            animationFrameRef.current = requestAnimationFrame(detectVoice);
          }
          return;
        }

        // Enhanced voice detection logic (optimized for short words)
        if (!isSpeaking && normalizedVolume > VOICE_THRESHOLD) {
          consecutiveVoiceFrames++;
          consecutiveSilenceFrames = 0;

          // Reduced from 5 to 3 frames for faster detection of short words
          if (!isCurrentlyListening && consecutiveVoiceFrames >= 3) {
            isCurrentlyListening = true;
            recordingStartTime = Date.now();
            startListening();
          }

          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          // Reduced silence timeout for short words like "ok"
          silenceTimerRef.current = setTimeout(() => {
            if (isCurrentlyListening) {
              const recordingDuration = Date.now() - recordingStartTime;
              // Reduced minimum duration from 500ms to 200ms for short words
              if (recordingDuration >= 200) {
                isCurrentlyListening = false;
                consecutiveVoiceFrames = 0;
                stopListening();
              } else {
                isCurrentlyListening = false;
                consecutiveVoiceFrames = 0;
                cancelRecording();
              }
            }
          }, SILENCE_TIMEOUT);
        } else {
          consecutiveVoiceFrames = 0;
          consecutiveSilenceFrames++;

          // Reduced from 10 to 8 frames for faster silence detection
          if (isCurrentlyListening && consecutiveSilenceFrames >= 8) {
            const recordingDuration = Date.now() - recordingStartTime;
            isCurrentlyListening = false;
            consecutiveVoiceFrames = 0;
            if (silenceTimerRef.current) {
              clearTimeout(silenceTimerRef.current);
            }

            // Reduced minimum duration for short words
            if (recordingDuration >= 200) {
              stopListening();
            } else {
              cancelRecording();
            }
          }
        }

        if (voiceDetectionActiveRef.current) {
          animationFrameRef.current = requestAnimationFrame(detectVoice);
        }
      } catch (error) {
        console.error("❌ Voice detection error:", error);
      }
    };

    detectVoice();
  }, [isSpeaking]);

  const startListening = useCallback(() => {
    // Double-check mute state before starting to record
    if (isMutedRef.current) {
      console.log("🔇 Attempted to start recording while muted - blocking");
      return;
    }

    if (!mediaRecorderRef.current || isRecordingRef.current) return;
    if (mediaRecorderRef.current.state !== "inactive") return;

    try {
      console.log("🎤 Starting to record");
      audioChunksRef.current = [];
      mediaRecorderRef.current.start(100);
      isRecordingRef.current = true;
    } catch (error) {
      console.error("❌ Recording start error:", error);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!mediaRecorderRef.current || !isRecordingRef.current) return;
    if (mediaRecorderRef.current.state !== "recording") return;

    try {
      console.log("⏹️ Stopping recording");
      mediaRecorderRef.current.stop();
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    } catch (error) {
      console.error("❌ Recording stop error:", error);
    }
  }, []);

  const cancelRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !isRecordingRef.current) return;

    try {
      console.log("❌ Canceling recording");

      // Set up a one-time listener to clear audio chunks when recording stops
      const handleStop = () => {
        console.log("🗑️ Clearing audio chunks - recording canceled");
        audioChunksRef.current = [];
        isRecordingRef.current = false;
        mediaRecorderRef.current?.removeEventListener("stop", handleStop);
      };

      if (mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.addEventListener("stop", handleStop, {
          once: true,
        });
        mediaRecorderRef.current.stop();
      } else {
        // If not recording, just clear everything
        audioChunksRef.current = [];
        isRecordingRef.current = false;
      }

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    } catch (error) {
      console.error("❌ Error canceling recording:", error);
      // Ensure we clean up even if there's an error
      audioChunksRef.current = [];
      isRecordingRef.current = false;
    }
  }, []);

  const sendAudioToServer = useCallback((audioBlob: Blob) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error("❌ Cannot send audio - WebSocket not connected");
      return;
    }

    // Reduced minimum size for short words like "ok"
    if (audioBlob.size < 800) {
      // Was 1500, now 800
      console.log(
        "⚠️ Audio blob too small, skipping:",
        audioBlob.size,
        "bytes"
      );
      return;
    }

    console.log("📤 Sending audio blob to server:", audioBlob.size, "bytes");
    try {
      wsRef.current.send(audioBlob);
    } catch (error) {
      console.error("❌ Error sending audio:", error);
    }
  }, []);

  const toggleMicrophone = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    // Update the ref to ensure voice detection gets the current state
    isMutedRef.current = newMutedState;

    // If we're muting and currently recording, cancel the recording immediately
    if (newMutedState && mediaRecorderRef.current?.state === "recording") {
      console.log("🔇 Muting microphone - canceling current recording");
      cancelRecording();
    }

    // If we're unmuting, clear any existing silence timer
    if (!newMutedState && silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    console.log("🎤 Microphone", newMutedState ? "muted" : "unmuted");
  }, [isMuted, cancelRecording]);

  const handleVoiceChange = useCallback((voiceId: string) => {
    setSelectedVoice(voiceId);
    setShowVoiceSelector(false);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log("🎤 Changing to Neural2 voice:", voiceId);
      const voiceMessage = {
        type: "set_voice",
        voice_id: voiceId,
      };
      wsRef.current.send(JSON.stringify(voiceMessage));
    }
  }, []);

  const handleConnect = useCallback(async () => {
    if (callStatus === CallStatus.CONNECTING) return;

    console.log("🔌 Starting connection...");
    setCallStatus(CallStatus.CONNECTING);
    setConnectionError(null);

    try {
      wsRef.current = new WebSocket(WEBSOCKET_URL);

      wsRef.current.onopen = () => {
        console.log("✅ WebSocket connected!");
        setCallStatus(CallStatus.ACTIVE);
        setConnectionError(null);
        setRetryCount(0);

        startHeartbeat();

        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            const voiceMessage = {
              type: "set_voice",
              voice_id: selectedVoice,
            };
            wsRef.current.send(JSON.stringify(voiceMessage));

            setTimeout(() => {
              // Fixed: Use normalizedUnit instead of parsing JSON
              console.log("📋 Current unit:", normalizedUnit);
              const context = {
                subject: subject || "General",
                unitTitle: normalizedUnit.title || "Introduction",
                unitContent: normalizedUnit.content || "Welcome to the course",
                style: style || "conversational",
                companionName: name || "AI Tutor",
                topic: topic || subject || "",
              };
              console.log("📤 Sending context:", context);

              const contextMessage = {
                type: "set_context",
                context,
              };
              wsRef.current?.send(JSON.stringify(contextMessage));

              setTimeout(() => {
                const startMessage = {
                  type: "start_conversation",
                };
                wsRef.current?.send(JSON.stringify(startMessage));

                setTimeout(() => {
                  initializeAudio();
                }, 500);
              }, 300);
            }, 300);
          }
        }, 200);
      };

      wsRef.current.onmessage = async (event) => {
        if (event.data instanceof Blob) {
          console.log(
            "🔊 Received Premium Neural2 audio blob:",
            event.data.size,
            "bytes"
          );
          try {
            await playAudioResponse(event.data);
          } catch (error) {
            console.error("❌ Audio playback error:", error);
          }
        } else {
          try {
            const data = JSON.parse(event.data);
            handleServerMessage(data);
          } catch (error) {
            console.error("❌ Failed to parse WebSocket message:", error);
          }
        }
      };

      wsRef.current.onclose = (event) => {
        console.log("🔌 WebSocket disconnected:", event.code, event.reason);
        stopHeartbeat();
        if (callStatus === CallStatus.ACTIVE && event.code !== 1000) {
          setConnectionError(
            `Connection lost: ${event.reason || "Unknown error"}`
          );
          handleReconnect();
        } else {
          setCallStatus(CallStatus.INACTIVE);
        }
        cleanup();
      };

      wsRef.current.onerror = (error) => {
        console.error("❌ WebSocket error:", error);
        setConnectionError("Connection error occurred");
        setCallStatus(CallStatus.ERROR);
        cleanup();
      };
    } catch (error) {
      console.error("❌ Connection failed:", error);
      setCallStatus(CallStatus.ERROR);
      setConnectionError(
        `Connection failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }, [
    callStatus,
    selectedVoice,
    normalizedUnit,
    subject,
    style,
    name,
    topic,
    handleServerMessage,
    playAudioResponse,
    initializeAudio,
  ]);

  const handleReconnect = useCallback(() => {
    if (retryCount < MAX_RETRY_ATTEMPTS) {
      const delay = Math.pow(2, retryCount) * 1000;
      setRetryCount((prev) => prev + 1);
      setCallStatus(CallStatus.CONNECTING);
      reconnectTimeoutRef.current = setTimeout(() => {
        handleConnect();
      }, delay);
    } else {
      setCallStatus(CallStatus.ERROR);
      setConnectionError("Connection failed after multiple attempts.");
    }
  }, [retryCount, handleConnect]);

  const startHeartbeat = useCallback(() => {
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "ping" }));
      }
    }, HEARTBEAT_INTERVAL);
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    console.log("🔌 Disconnecting...");
    setCallStatus(CallStatus.FINISHED);
    addToSessionHistory(companionId);
    if (wsRef.current) {
      wsRef.current.close(1000, "User disconnected");
    }
    cleanup();
  }, [companionId]);

  const cleanup = useCallback(() => {
    console.log("🧹 Cleaning up resources...");
    voiceDetectionActiveRef.current = false;

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    stopHeartbeat();

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.error("❌ Error stopping recording:", error);
      }
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    mediaRecorderRef.current = null;
    isRecordingRef.current = false;
    audioChunksRef.current = [];
  }, [stopHeartbeat]);

  useEffect(() => {
    if (lottieRef.current) {
      if (isSpeaking) {
        lottieRef.current.play();
      } else {
        lottieRef.current.stop();
      }
    }
  }, [isSpeaking]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const StatusIndicator = () => {
    const getStatusColor = () => {
      switch (callStatus) {
        case CallStatus.ACTIVE:
          return "bg-green-500";
        case CallStatus.CONNECTING:
          return "bg-yellow-500";
        case CallStatus.ERROR:
          return "bg-red-500";
        default:
          return "bg-gray-500";
      }
    };

    const getStatusText = () => {
      switch (callStatus) {
        case CallStatus.ACTIVE:
          return "Connected";
        case CallStatus.CONNECTING:
          return retryCount > 0
            ? `Reconnecting (${retryCount}/${MAX_RETRY_ATTEMPTS})`
            : "Connecting";
        case CallStatus.ERROR:
          return "Error";
        case CallStatus.FINISHED:
          return "Finished";
        default:
          return "Offline";
      }
    };

    return (
      <div className="flex items-center gap-2 text-sm">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            getStatusColor(),
            callStatus === CallStatus.CONNECTING && "animate-pulse"
          )}
        />
        <span className="text-gray-600">{getStatusText()}</span>
        {callStatus === CallStatus.ACTIVE && (
          <span className="text-xs text-gray-500">• Neural2 TTS</span>
        )}
      </div>
    );
  };

  const VoiceSelector = () => {
    const currentVoice = availableVoices.find((v) => v.id === selectedVoice);

    return (
      <div className="relative">
        <button
          onClick={() => setShowVoiceSelector(!showVoiceSelector)}
          disabled={
            callStatus === CallStatus.ACTIVE ||
            callStatus === CallStatus.CONNECTING
          }
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors w-full justify-between",
            (callStatus === CallStatus.ACTIVE ||
              callStatus === CallStatus.CONNECTING) &&
              "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex items-center gap-2">
            <Volume2 size={16} />
            <div className="text-left">
              <div className="font-medium">
                {currentVoice?.name || "Select Voice"}
              </div>
              {currentVoice?.voice_name && (
                <div className="text-xs text-gray-500">
                  {currentVoice.voice_name}
                </div>
              )}
            </div>
          </div>
          <ChevronDown size={16} />
        </button>

        {showVoiceSelector && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            {availableVoices.map((voice) => (
              <button
                key={voice.id}
                onClick={() => handleVoiceChange(voice.id)}
                className={cn(
                  "w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors",
                  selectedVoice === voice.id && "bg-blue-50 text-blue-700"
                )}
              >
                <div className="font-medium text-sm">{voice.name}</div>
                {voice.voice_name && (
                  <div className="text-xs text-blue-600">
                    {voice.voice_name}
                  </div>
                )}
                <div className="text-xs text-gray-500">{voice.description}</div>
                <div className="text-xs text-gray-400">
                  {voice.language} • {voice.gender}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  const MicrophoneIndicator = () => {
    if (callStatus !== CallStatus.ACTIVE) return null;

    return (
      <div className="flex items-center gap-2 text-xs">
        {isMuted ? (
          <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full border border-red-200">
            <MicOff size={12} />
            <span className="font-medium">Muted</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-200">
            <Mic size={12} />
            <span className="font-medium">Active</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="flex flex-col h-[70vh]">
      {connectionError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="text-red-400 mr-2" size={20} />
            <div>
              <p className="text-red-700 font-medium">Connection Error</p>
              <p className="text-red-600 text-sm">{connectionError}</p>
              {retryCount < MAX_RETRY_ATTEMPTS && (
                <button
                  onClick={handleConnect}
                  className="text-red-800 underline text-sm mt-1 hover:no-underline"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <section className="flex max-sm:flex-col h-full">
        {/* Left Side - Companion Avatar and Controls */}
        <div className="flex flex-col flex-1 max-w-[50%] max-sm:max-w-none max-sm:min-w-0">
          {/* Avatar & Name */}
          <div className="companion-section w-[90%] mb-6">
            <div
              className="companion-avatar relative"
              style={{ backgroundColor: color }}
            >
              {/* Static avatar */}
              <div
                className={cn(
                  "absolute transition-opacity duration-1000",
                  callStatus === CallStatus.FINISHED ||
                    callStatus === CallStatus.INACTIVE ||
                    callStatus === CallStatus.ERROR
                    ? "opacity-100"
                    : "opacity-0",
                  callStatus === CallStatus.CONNECTING &&
                    "opacity-100 animate-pulse"
                )}
              >
                <Image
                  src={`/icons/robot.jpg`}
                  alt={subject}
                  width={150}
                  height={150}
                  className="max-sm:w-12 max-sm:h-12 max-sm:block sm:w-[150px] sm:h-[150px] rounded-full"
                />
              </div>

              {/* Animated avatar */}
              <div
                className={cn(
                  "absolute transition-opacity duration-1000",
                  callStatus === CallStatus.ACTIVE ? "opacity-100" : "opacity-0"
                )}
              >
                <Lottie
                  lottieRef={lottieRef}
                  animationData={soundwaves}
                  autoplay={false}
                  className="companion-lottie"
                />
              </div>
            </div>

            <div className="text-center mt-4 space-y-2">
              <p className="font-bold text-2xl max-sm:hidden">{name}</p>
              <StatusIndicator />
              <MicrophoneIndicator />
            </div>
          </div>

          {/* Voice Selector */}
          <div className="w-[90%] mb-4 max-sm:w-[100%]">
            <VoiceSelector />
          </div>

          {/* Controls */}
          <div className="flex flex-row gap-2 justify-end mb-6 w-[90%] max-sm:flex-col">
            <button
              className={cn(
                "btn-mic flex items-center gap-2 w-[50%] px-3 py-2 rounded-md text-sm justify-center max-sm:w-[100%] transition-colors",
                isMuted
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                callStatus !== CallStatus.ACTIVE &&
                  "opacity-50 cursor-not-allowed"
              )}
              onClick={toggleMicrophone}
              disabled={callStatus !== CallStatus.ACTIVE}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
              <span>{isMuted ? "Mic Off" : "Mic On"}</span>
            </button>

            <button
              onClick={
                callStatus === CallStatus.ACTIVE ||
                callStatus === CallStatus.CONNECTING
                  ? handleDisconnect
                  : handleConnect
              }
              disabled={
                callStatus === CallStatus.ERROR &&
                retryCount >= MAX_RETRY_ATTEMPTS
              }
              className={cn(
                "rounded-md px-3 py-2 text-sm text-white w-[50%] max-sm:w-[100%] transition-colors",
                callStatus === CallStatus.ACTIVE ||
                  callStatus === CallStatus.CONNECTING
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-primary hover:bg-primary/90",
                callStatus === CallStatus.CONNECTING && "animate-pulse",
                callStatus === CallStatus.ERROR &&
                  retryCount >= MAX_RETRY_ATTEMPTS &&
                  "bg-gray-400 cursor-not-allowed"
              )}
            >
              {callStatus === CallStatus.ACTIVE
                ? "End Call"
                : callStatus === CallStatus.CONNECTING
                ? retryCount > 0
                  ? "Reconnecting..."
                  : "Connecting..."
                : callStatus === CallStatus.ERROR &&
                  retryCount >= MAX_RETRY_ATTEMPTS
                ? "Connection Failed"
                : "Start Call"}
            </button>
          </div>

          {/* Enhanced Conversation Transcript */}
          <section className="flex-1 w-[90%] max-sm:w-[100%] mb-6">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm h-full flex flex-col">
              {/* Transcript Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                <div className="flex items-center gap-2">
                  <MessageSquare size={20} className="text-blue-500" />
                  <h3 className="font-semibold text-gray-800">Conversation</h3>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    {messages.length} messages
                  </span>
                </div>
                {messages.length > 0 && (
                  <button
                    onClick={clearTranscript}
                    className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Clear transcript"
                  >
                    <Trash2 size={14} />
                    Clear
                  </button>
                )}
              </div>

              {/* Transcript Content */}
              <div
                ref={transcriptScrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[400px]"
              >
                {messages.length === 0 &&
                  callStatus === CallStatus.INACTIVE && (
                    <div className="text-center text-gray-500 py-8">
                      <MessageSquare
                        size={48}
                        className="mx-auto mb-4 text-gray-300"
                      />
                      <p className="font-medium mb-2">
                        Ready to start your conversation
                      </p>
                      <div className="text-sm space-y-1">
                        <p>• Select a voice above</p>
                        <p>• Click "Start Call" to begin</p>
                        <p>• Your conversation will appear here</p>
                      </div>
                    </div>
                  )}

                {/* Display messages in reverse order (newest first visually, but scroll to bottom) */}
                {messages
                  .slice()
                  .reverse()
                  .map((message, index) => {
                    const displayName =
                      message.role === "assistant"
                        ? name.split(" ")[0].replace(/[.,]/g, "")
                        : message.role === "error"
                        ? "System"
                        : userName || "You";

                    const isUser = message.role === "user";
                    const isError = message.role === "error";
                    const isAssistant = message.role === "assistant";

                    return (
                      <div
                        key={`${messages.length - 1 - index}-${
                          message.timestamp
                        }`}
                        className={cn(
                          "flex gap-3 animate-in slide-in-from-bottom-2 duration-300",
                          isUser && "flex-row-reverse"
                        )}
                      >
                        {/* Avatar */}
                        <div
                          className={cn(
                            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                            isUser && "bg-blue-500 text-white",
                            isAssistant && "bg-green-500 text-white",
                            isError && "bg-red-500 text-white"
                          )}
                        >
                          {isUser ? "You" : isAssistant ? "AI" : "⚠️"}
                        </div>

                        {/* Message Content */}
                        <div
                          className={cn(
                            "flex-1 max-w-[80%]",
                            isUser && "flex flex-col items-end"
                          )}
                        >
                          <div
                            className={cn(
                              "rounded-lg px-4 py-2 break-words",
                              isUser && "bg-blue-500 text-white",
                              isAssistant && "bg-gray-100 text-gray-800",
                              isError &&
                                "bg-red-50 text-red-800 border border-red-200"
                            )}
                          >
                            <p className="text-sm leading-relaxed">
                              {message.content}
                            </p>
                          </div>

                          {/* Timestamp and Name */}
                          <div
                            className={cn(
                              "flex items-center gap-2 mt-1 text-xs text-gray-500",
                              isUser && "flex-row-reverse"
                            )}
                          >
                            <span className="font-medium">{displayName}</span>
                            {message.timestamp && (
                              <span>
                                {new Date(message.timestamp).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                {/* Typing indicator when processing */}
                {callStatus === CallStatus.ACTIVE &&
                  messages.length > 0 &&
                  messages[0]?.role === "user" && (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">
                        AI
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-[80%]">
                          <div className="flex items-center gap-1">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 ml-2">
                              AI is thinking...
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              {/* Transcript Footer */}
              {messages.length > 0 && (
                <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 rounded-b-lg">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {callStatus === CallStatus.ACTIVE
                        ? "Live conversation"
                        : "Conversation ended"}
                    </span>
                    <span>
                      {messages.filter((m) => m.role === "user").length} user
                      messages •{" "}
                      {messages.filter((m) => m.role === "assistant").length} AI
                      responses
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Side - Course Content */}
        <div className="flex-1 min-w-0 max-w-[50%] max-sm:max-w-none">
          <div className="course-section h-full">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                Course Content
              </h2>
              <div className="space-y-4 max-h-[calc(100%-4rem)] overflow-y-auto">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className="border border-gray-300 rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md"
                  >
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full bg-gray-50 hover:bg-gray-100 px-6 py-4 text-left flex justify-between items-center transition-colors"
                    >
                      <div>
                        <h3 className="text-lg font-medium text-gray-800">
                          {section.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {section.description}
                        </p>
                      </div>
                      {openSectionId === section.id ? (
                        <ChevronUp className="text-gray-500" />
                      ) : (
                        <ChevronDown className="text-gray-500" />
                      )}
                    </button>

                    {openSectionId === section.id && (
                      <ul className="bg-white divide-y divide-gray-200">
                        {section.units.map((unitItem) => (
                          <div
                            className={cn(
                              "flex items-center justify-between rounded-md transition-colors px-4",
                              unitItem.id === normalizedUnit.id
                                ? "bg-blue-50 border-l-4 border-blue-500"
                                : "hover:bg-gray-50"
                            )}
                            key={unitItem.id}
                          >
                            {/* Main Unit Row Link */}
                            <Link
                              key={unitItem.id}
                              href={`/companions/${companionId}/${unitItem.id}`}
                              className="flex items-center gap-2 px-6 py-3 flex-1 text-gray-700"
                            >
                              <BookOpen size={16} className="text-purple-500" />
                              <span className="text-sm flex-1 truncate">
                                {unitItem.title}
                              </span>
                              {unitItem.id === normalizedUnit.id && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full whitespace-nowrap">
                                  Current
                                </span>
                              )}
                            </Link>

                            {/* Summary Button - aligned right */}
                            <Link
                              href={`/companions/summary/${companionId}/${unitItem.id}`}
                              className="text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md transition inline-block ml-2"
                            >
                              Summary
                            </Link>
                          </div>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    </section>
  );
};

export default CompanionComponent;
