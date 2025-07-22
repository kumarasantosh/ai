"use client";
import { cn, configureAssistant } from "@/lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { vapi } from "@/lib/vapi.sdk";
import Image from "next/image";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import soundwaves from "@/constants/soundwaves.json";
import { addToSessionHistory } from "@/lib/action/companion.action";
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  Clock,
  Layers,
  Calendar,
} from "lucide-react";
import Link from "next/link";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

const CompanionComponent = ({
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
}: {
  unit: {
    id: string;
    section_id: string;
    title: string;
    content: string;
    prompt: string | null;
  };
  companion: Companion;
  sections: Section[];
} & CompanionComponentProps) => {
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setOpenSectionId(openSectionId === id ? null : id);
  };
  useEffect(() => {
    if (lottieRef) {
      if (isSpeaking) lottieRef.current?.play();
      else lottieRef.current?.stop();
    }
  }, [isSpeaking, lottieRef]);
  useEffect(() => {
    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);
    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const transcriptContent =
          message.transcript || "No transcript available";
        const newMessage = { role: message.role, content: transcriptContent };
        setMessages((prev) => [newMessage, ...prev]);
      }
    };

    const onError = (error: Error) => console.log("error", error);
    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);
    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("error", onError);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("error", onError);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
    };
  }, []);
  const toggleMicrophone = () => {
    const isMuted = vapi.isMuted();
    vapi.setMuted(!isMuted);
    setIsMuted(!isMuted);
  };

  const handleConnect = () => {
    setCallStatus(CallStatus.CONNECTING);
    const assistantOverrides = {
      variableValues: {
        subject,
        content: unit.content,
        style,
      },
      clientMessages: ["transcript"],
      serverMessages: [],
    };
    console.log(unit.content);
    console.log(unit.title);
    //@ts-expect-error
    vapi.start(
      configureAssistant(voice, style, unit, topic),
      assistantOverrides
    );
  };

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    addToSessionHistory(companionId);
    vapi.stop();
  };

  return (
    <section className="flex flex-col h-[70vh]">
      {/* Main Layout - Companion Left, Course Content Right */}
      <section className="flex  max-sm:flex-col h-full">
        {/* Left Side - Companion Avatar and Transcript */}
        <div className="flex flex-col flex-1 max-w-[50%] max-sm:max-w-none max-sm:min-w-0">
          {/* Avatar & Name */}
          <div className="companion-section w-[90%] mb-6">
            <div
              className="companion-avatar"
              style={{ backgroundColor: color }}
            >
              <div
                className={cn(
                  "absolute transition-opacity duration-1000",
                  callStatus === CallStatus.FINISHED ||
                    callStatus === CallStatus.INACTIVE
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
                  className="max-sm:w-12 max-sm:h-12 max-sm:block sm:w-[150px] sm:h-[150px]"
                />
              </div>
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
            <p className="font-bold text-2xl max-sm:hidden text-center mt-4">
              {name}
            </p>
          </div>

          {/* Mic & Session Buttons - positioned below companion but aligned to the right in a row */}
          <div className="flex flex-row gap-2 justify-end mb-6 w-[90%] max-sm:flex-col ">
            <button
              className="btn-mic flex items-center gap-2 w-[50%] px-3 py-2 rounded-md bg-gray-100 text-sm justify-center max-sm:w-[100%]"
              onClick={toggleMicrophone}
              disabled={callStatus !== CallStatus.ACTIVE}
            >
              <Image
                width={20}
                height={20}
                src={isMuted ? "/icons/mic-off.svg" : "/icons/mic-on.svg"}
                alt=""
              />
              <span>{isMuted ? "Mic Off" : "Mic On"}</span>
            </button>

            <button
              onClick={
                callStatus === CallStatus.ACTIVE
                  ? handleDisconnect
                  : handleConnect
              }
              className={cn(
                "rounded-md px-3 py-2 text-sm  text-white  w-[50%] max-sm:w-[100%]",
                callStatus === CallStatus.ACTIVE ? "bg-red-500" : "bg-primary",
                callStatus === CallStatus.CONNECTING && "animate-pulse"
              )}
            >
              {callStatus === CallStatus.ACTIVE
                ? "End"
                : callStatus === CallStatus.CONNECTING
                ? "Connecting"
                : "Start"}
            </button>
          </div>

          {/* Transcript */}
          <section className="transcript flex-1 w-full">
            <div className="transcript-message no-scrollbar">
              {messages.map((message, index) => {
                if (message.role === "assistant") {
                  return (
                    <p key={index} className="max-sm:text-sm">
                      {name.split(" ")[0].replace("/[.,]/g", ",")}:
                      {message.content}
                    </p>
                  );
                } else {
                  return (
                    <p key={index} className="text-primary max-sm:text-sm">
                      {userName} : {message.content}
                    </p>
                  );
                }
              })}
            </div>
            <div className="transcript-fade" />
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
                    className="border border-gray-300 rounded-xl overflow-hidden"
                  >
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full bg-gray-50 hover:bg-gray-100 px-6 py-4 text-left flex justify-between items-center"
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

                    {/* Units */}
                    {openSectionId === section.id && (
                      <ul className="bg-white divide-y divide-gray-200">
                        {section.units.map((unit) => (
                          <Link
                            key={unit.id}
                            href={`/companions/${companionId}/${unit.id}`}
                          >
                            <li
                              key={unit.id}
                              className="flex items-center gap-2 px-6 py-3 text-gray-700 hover:bg-gray-50"
                            >
                              <BookOpen size={16} className="text-purple-500" />
                              <span className="text-sm">{unit.title}</span>
                            </li>
                          </Link>
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
