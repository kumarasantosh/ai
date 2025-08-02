"use client";
import React, { useState, useRef, useEffect } from "react";

const VoiceChatBot = () => {
  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Live session state
  const [isLiveSession, setIsLiveSession] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  // Configuration
  const [serverUrl, setServerUrl] = useState(
    "wss://ws.justsantosh.site/conversation"
  );
  const [silenceTimeout, setSilenceTimeout] = useState(1000);
  const [sensitivity, setSensitivity] = useState(0.06); // 6% - above background noise
  const [interruptionSensitivity, setInterruptionSensitivity] = useState(0.07); // 7%
  const [selectedVoice, setSelectedVoice] = useState("21m00Tcm4TlvDq8ikWAM");

  // Available voices from ElevenLabs
  const voices = [
    {
      id: "21m00Tcm4TlvDq8ikWAM",
      name: "Rachel - Calm & Warm",
      gender: "female",
    },
    {
      id: "EXAVITQu4vr4xnSDxMaL",
      name: "Sarah - Soft & Sweet",
      gender: "female",
    },
    {
      id: "9F4C8ztpNUmXkdDDbz3J",
      name: "Laura - Professional",
      gender: "female",
    },
    {
      id: "FGY2WhTYpPnrIDTdsKH5",
      name: "Charlie - Conversational",
      gender: "female",
    },
    {
      id: "IKne3meq5aSn9XLyUdCD",
      name: "Charlotte - Mature & Warm",
      gender: "female",
    },
    {
      id: "XB0fDUnXU5powFXDhCwa",
      name: "Matilda - Young & Bright",
      gender: "female",
    },
    { id: "pMsXgVXv3BLzUgSXRplE", name: "Sonja - Energetic", gender: "female" },
    {
      id: "SAz9YHcvj6GT2YYXdXww",
      name: "Olivia - British Accent",
      gender: "female",
    },
    { id: "ErXwobaYiN019PkySvjV", name: "Antoni - Friendly", gender: "male" },
    {
      id: "VR6AewLTigWG4xSOukaG",
      name: "Arnold - Deep & Authoritative",
      gender: "male",
    },
    { id: "pNInz6obpgDQGcFmaJgB", name: "Adam - Professional", gender: "male" },
    {
      id: "yoZ06aMxZJJ28mfd3POQ",
      name: "Sam - Young & Casual",
      gender: "male",
    },
    {
      id: "TxGEqnHWrfWFTfGW9XjX",
      name: "Josh - Warm & Engaging",
      gender: "male",
    },
    {
      id: "g5CIjZEefAph4nQFvHAz",
      name: "George - British Butler",
      gender: "male",
    },
  ];

  // Refs
  const wsRef = useRef(null);
  const streamRef = useRef(null);
  const currentAudioRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const isRecordingRef = useRef(false);
  const audioChunksRef = useRef([]);
  const voiceDetectionActiveRef = useRef(false);
  const animationFrameRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Icons
  const PhoneIcon = ({ className, size = 24 }) => (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );

  const PhoneOffIcon = ({ className, size = 24 }) => (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
      <line x1="23" y1="1" x2="1" y2="23" />
    </svg>
  );

  const MicIcon = ({ className, size = 24 }) => (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );

  const Volume2Icon = ({ className, size = 24 }) => (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add message to chat
  const addMessage = (message, type = "system") => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        text: message,
        type,
        timestamp: new Date(),
      },
    ]);
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Connect to WebSocket
  const connectToBot = async () => {
    if (isConnected || isConnecting) return;

    setIsConnecting(true);
    addMessage("🔄 Connecting to AI assistant...", "system");

    try {
      wsRef.current = new WebSocket(serverUrl);

      wsRef.current.onopen = async () => {
        setIsConnected(true);
        setIsConnecting(false);
        addMessage("✅ Connected! Setting up voice...", "system");

        // Send selected voice first
        setTimeout(() => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            console.log("Sending voice selection:", selectedVoice);
            wsRef.current.send(
              JSON.stringify({
                type: "set_voice",
                voice_id: selectedVoice,
              })
            );

            // Then start the conversation after voice is set
            setTimeout(() => {
              console.log("Starting conversation...");
              wsRef.current.send(
                JSON.stringify({
                  type: "start_conversation",
                })
              );

              // Start live session after introduction begins
              setTimeout(() => startLiveSession(), 500);
            }, 300);
          }
        }, 100);
      };

      wsRef.current.onmessage = async (event) => {
        try {
          if (event.data instanceof Blob) {
            await playAudioResponse(event.data);
          } else {
            const data = JSON.parse(event.data);
            handleServerMessage(data);
          }
        } catch (error) {
          console.error("Message error:", error);
        }
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
        setIsLiveSession(false);
        setIsListening(false);
        setIsProcessing(false);
        addMessage("❌ Call ended", "system");
        stopLiveSession();
      };

      wsRef.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnecting(false);
        addMessage("❌ Connection failed", "error");
      };
    } catch (error) {
      console.error("Connection failed:", error);
      setIsConnecting(false);
      addMessage(`❌ Failed to connect: ${error.message}`, "error");
    }
  };

  // Start live session
  const startLiveSession = async () => {
    try {
      // Request microphone
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

      // Set up audio context
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      // Set up MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 16000,
      });

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        console.log(
          "MediaRecorder stopped, chunks:",
          audioChunksRef.current.length
        );
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: mimeType,
          });
          console.log("Sending audio blob:", audioBlob.size, "bytes");
          sendAudioToServer(audioBlob);
          audioChunksRef.current = [];
        }
        isRecordingRef.current = false;
      };

      setIsLiveSession(true);
      addMessage("🎤 Microphone ready - AI will introduce itself", "system");

      // Reset recording flag just in case
      isRecordingRef.current = false;

      // Start voice detection after AI introduction
      setTimeout(() => {
        startVoiceActivityDetection();
      }, 3000);
    } catch (error) {
      console.error("Failed to start live session:", error);
      addMessage(`❌ Microphone access failed: ${error.message}`, "error");
    }
  };

  // Voice activity detection
  const startVoiceActivityDetection = () => {
    if (!analyserRef.current || voiceDetectionActiveRef.current) return;

    voiceDetectionActiveRef.current = true;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    let voiceStartTime = null;
    let consecutiveSilence = 0;
    let isCurrentlyListening = false;

    const detectVoice = () => {
      if (!voiceDetectionActiveRef.current || !analyserRef.current) return;

      try {
        analyserRef.current.getByteFrequencyData(dataArray);
        const average =
          dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        const normalizedVolume = average / 255;

        // Log for debugging - only log significant changes
        if (
          normalizedVolume > sensitivity ||
          (normalizedVolume > 0.03 && Math.random() < 0.1)
        ) {
          console.log(
            "Voice level:",
            (normalizedVolume * 100).toFixed(1) + "%",
            normalizedVolume > sensitivity ? "🎤 SPEAKING" : ""
          );
        }

        // Interruption detection
        if (isPlaying && normalizedVolume > interruptionSensitivity) {
          console.log("Interrupting AI speech");
          stopCurrentAudio();
          if (!isCurrentlyListening && !isProcessing) {
            isCurrentlyListening = true;
            startListening();
            voiceStartTime = Date.now();
          }
        }
        // Normal voice detection
        else if (
          !isPlaying &&
          !isProcessing &&
          normalizedVolume > sensitivity
        ) {
          consecutiveSilence = 0;

          if (!isCurrentlyListening) {
            console.log("Starting to listen - voice detected");
            isCurrentlyListening = true;
            startListening();
            voiceStartTime = Date.now();
          }

          // Reset silence timer
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          silenceTimerRef.current = setTimeout(() => {
            if (isCurrentlyListening && !isProcessing) {
              const duration = Date.now() - voiceStartTime;
              console.log("Silence detected after", duration, "ms of speech");
              isCurrentlyListening = false;
              stopListening();
              voiceStartTime = null;
            }
          }, silenceTimeout);
        } else if (isCurrentlyListening && normalizedVolume < sensitivity) {
          consecutiveSilence++;
          // If we have 10 consecutive silent frames, that's additional confirmation
          if (consecutiveSilence > 10) {
            console.log("Extended silence detected");
          }
        }

        // Continue detection
        if (voiceDetectionActiveRef.current) {
          animationFrameRef.current = requestAnimationFrame(detectVoice);
        }
      } catch (error) {
        console.error("Voice detection error:", error);
      }
    };

    detectVoice();
  };

  // Start listening
  const startListening = () => {
    // Check recorder state first
    if (!mediaRecorderRef.current) {
      console.log("No media recorder available");
      return;
    }

    // Reset recording flag if recorder is not actually recording
    if (
      mediaRecorderRef.current.state !== "recording" &&
      isRecordingRef.current
    ) {
      console.log(
        "Resetting recording flag - recorder state:",
        mediaRecorderRef.current.state
      );
      isRecordingRef.current = false;
    }

    if (isRecordingRef.current || isProcessing) {
      console.log("Already recording or processing");
      return;
    }

    if (mediaRecorderRef.current.state !== "inactive") {
      console.log("Recorder not inactive:", mediaRecorderRef.current.state);
      return;
    }

    try {
      console.log("Starting recording...");
      audioChunksRef.current = [];
      mediaRecorderRef.current.start(100);
      isRecordingRef.current = true;
      setIsListening(true);
      addMessage("👂 Listening...", "system");
    } catch (error) {
      console.error("Recording error:", error);
      isRecordingRef.current = false;
      addMessage(`❌ Recording error: ${error.message}`, "error");
    }
  };

  // Stop listening
  const stopListening = () => {
    console.log("Stopping listening...");

    if (!mediaRecorderRef.current || !isRecordingRef.current) {
      console.log("Not recording");
      setIsListening(false);
      return;
    }

    if (mediaRecorderRef.current.state !== "recording") {
      console.log("Recorder not recording:", mediaRecorderRef.current.state);
      setIsListening(false);
      return;
    }

    try {
      console.log("Stopping recorder...");
      setIsListening(false);
      addMessage("🔄 Processing your speech...", "system");
      mediaRecorderRef.current.stop();

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
    } catch (error) {
      console.error("Stop recording error:", error);
      setIsListening(false);
      setIsProcessing(false);
    }
  };

  // Send audio to server
  const sendAudioToServer = (audioBlob) => {
    console.log("Sending audio to server:", audioBlob.size, "bytes");

    if (wsRef.current?.readyState === WebSocket.OPEN && audioBlob.size > 0) {
      setIsProcessing(true);
      wsRef.current.send(audioBlob);
      addMessage(`📤 Sent audio (${audioBlob.size} bytes)`, "system");
    } else {
      console.error("Cannot send audio - WebSocket not ready or empty blob");
      setIsProcessing(false);
    }
  };

  // Handle server messages
  const handleServerMessage = (data) => {
    switch (data.type) {
      case "connection_established":
        break;

      case "transcript":
        setTranscript(data.text);
        addMessage(data.text, "user");
        break;

      case "ai_response":
        setAiResponse(data.text);
        addMessage(data.text, "ai");
        break;

      case "audio_start":
        setIsPlaying(true);
        break;

      case "audio_end":
        setIsPlaying(false);
        setIsProcessing(false);
        break;

      case "processing_start":
        // Silent processing
        break;

      case "no_speech_detected":
        setIsProcessing(false);
        addMessage("❌ No speech detected - try speaking louder", "system");
        break;

      case "error":
        addMessage(`❌ Error: ${data.message}`, "error");
        setIsProcessing(false);
        break;
    }
  };

  // Play audio response
  const playAudioResponse = async (audioBlob) => {
    try {
      stopCurrentAudio();

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      audio.onplay = () => {
        setIsPlaying(true);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setIsProcessing(false);
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setIsProcessing(false);
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error("Audio playback error:", error);
      setIsPlaying(false);
      setIsProcessing(false);
    }
  };

  // Stop current audio
  const stopCurrentAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
      setIsPlaying(false);

      // Send interruption signal to server
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "interrupt_ai" }));
        console.log("Sent interruption signal to server");
      }
    }
  };

  // Disconnect
  const disconnectFromBot = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    stopLiveSession();
    setMessages([]);
    setTranscript("");
    setAiResponse("");
  };

  // Stop live session
  const stopLiveSession = () => {
    voiceDetectionActiveRef.current = false;
    setIsLiveSession(false);
    setIsListening(false);
    setIsProcessing(false);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    stopCurrentAudio();

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
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectFromBot();
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          📞 AI Voice Assistant
        </h1>
        <p className="text-gray-600">
          Click "Start Call" to begin a natural conversation
        </p>
      </div>

      {/* Connection Controls */}
      <div
        className={`p-6 rounded-lg mb-6 ${
          isConnected
            ? "bg-green-100 border border-green-300"
            : "bg-gray-100 border border-gray-300"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div
              className={`w-4 h-4 rounded-full ${
                isConnected ? "bg-green-500" : "bg-gray-400"
              } ${isConnecting ? "animate-pulse" : ""}`}
            ></div>
            <span className="font-medium text-lg text-gray-800">
              {isConnecting
                ? "Connecting..."
                : isConnected
                ? "Call Active"
                : "Ready to Connect"}
            </span>
          </div>

          <div>
            {!isConnected ? (
              <button
                onClick={connectToBot}
                disabled={isConnecting}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  isConnecting
                    ? "bg-gray-400 cursor-not-allowed text-gray-200"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                <PhoneIcon size={20} />
                <span>{isConnecting ? "Connecting..." : "Start Call"}</span>
              </button>
            ) : (
              <button
                onClick={disconnectFromBot}
                className="flex items-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
              >
                <PhoneOffIcon size={20} />
                <span>End Call</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Status */}
      {isLiveSession && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-center space-x-8">
            <div
              className={`flex flex-col items-center ${
                isListening ? "opacity-100" : "opacity-40"
              }`}
            >
              <MicIcon
                className={
                  isListening ? "text-red-500 animate-pulse" : "text-gray-400"
                }
                size={32}
              />
              <span className="text-sm mt-2">
                {isListening ? "Listening..." : "Silent"}
              </span>
            </div>

            <div
              className={`flex flex-col items-center ${
                isProcessing ? "opacity-100" : "opacity-40"
              }`}
            >
              <div className={`text-2xl ${isProcessing ? "animate-spin" : ""}`}>
                ⚙️
              </div>
              <span className="text-sm mt-2">
                {isProcessing ? "Processing..." : "Ready"}
              </span>
            </div>

            <div
              className={`flex flex-col items-center ${
                isPlaying ? "opacity-100" : "opacity-40"
              }`}
            >
              <Volume2Icon
                className={
                  isPlaying ? "text-blue-500 animate-pulse" : "text-gray-400"
                }
                size={32}
              />
              <span className="text-sm mt-2">
                {isPlaying ? "AI Speaking" : "Silent"}
              </span>
            </div>
          </div>

          <div className="text-center mt-4">
            <p
              className={`font-medium ${
                isPlaying
                  ? "text-blue-600"
                  : isListening
                  ? "text-red-600"
                  : "text-green-600"
              }`}
            >
              {isPlaying
                ? "AI is speaking - just talk to interrupt!"
                : isListening
                ? "Listening to you..."
                : "Speak anytime to start talking"}
            </p>
          </div>
        </div>
      )}

      {/* Chat Log */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Conversation</h2>
        </div>
        <div className="h-96 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Click "Start Call" to begin your conversation
            </p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg ${
                  message.type === "user"
                    ? "bg-blue-100 border-l-4 border-blue-500 ml-8"
                    : message.type === "ai"
                    ? "bg-green-100 border-l-4 border-green-500 mr-8"
                    : message.type === "error"
                    ? "bg-red-100 border-l-4 border-red-500"
                    : "bg-gray-100 border-l-4 border-gray-400"
                }`}
              >
                <div className="flex justify-between items-start">
                  <p
                    className={`flex-1 ${
                      message.type === "error"
                        ? "text-red-700"
                        : "text-gray-800"
                    }`}
                  >
                    {message.text}
                  </p>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Settings */}
      <div className="mt-6 bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold mb-3">Settings</h3>

        {/* Voice Selection */}
        <div className="mb-4">
          <label className="text-sm text-gray-600 block mb-2">AI Voice</label>
          <select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={isLiveSession}
          >
            <optgroup label="Female Voices">
              {voices
                .filter((v) => v.gender === "female")
                .map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Male Voices">
              {voices
                .filter((v) => v.gender === "male")
                .map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name}
                  </option>
                ))}
            </optgroup>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Choose a voice before starting the call
          </p>
        </div>

        {/* Voice Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-600">
              Silence Timeout: {silenceTimeout}ms
            </label>
            <input
              type="range"
              min="500"
              max="3000"
              step="100"
              value={silenceTimeout}
              onChange={(e) => setSilenceTimeout(Number(e.target.value))}
              className="w-full"
              disabled={isLiveSession}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">
              Voice Sensitivity: {(sensitivity * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0.03"
              max="0.15"
              step="0.01"
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              className="w-full"
              disabled={isLiveSession}
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">
              Interrupt Sensitivity:{" "}
              {(interruptionSensitivity * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0.04"
              max="0.15"
              step="0.01"
              value={interruptionSensitivity}
              onChange={(e) =>
                setInterruptionSensitivity(Number(e.target.value))
              }
              className="w-full"
              disabled={isLiveSession}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceChatBot;
