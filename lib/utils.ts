import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { subjectsColors, voices } from "@/constants";
import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getSubjectColor = (subject: string) => {
  return subjectsColors[subject as keyof typeof subjectsColors];
};

export const generateRandomPastelColor = () => {
  const gradients = [
    // Deep Purple to Blue family
    "linear-gradient(135deg, #4c63d2 0%, #5a4fcf 100%)",
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
    "linear-gradient(135deg, #8360c3 0%, #2ebf91 100%)",
    "linear-gradient(135deg, #5f27cd 0%, #341f97 100%)",
    "linear-gradient(135deg, #9c88ff 0%, #8c7ae6 100%)",
    "linear-gradient(135deg, #3742fa 0%, #2f3542 100%)",

    // Rich Pink to Purple gradients
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)",
    "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    "linear-gradient(135deg, #ff6b95 0%, #c44569 100%)",
    "linear-gradient(135deg, #ff9ff3 0%, #f368e0 100%)",
    "linear-gradient(135deg, #fda085 0%, #f6d365 100%)",
    "linear-gradient(135deg, #fa7671 0%, #9b59b6 100%)",
    "linear-gradient(135deg, #ff5f6d 0%, #ffc371 100%)",

    // Deep Ocean gradients
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)",
    "linear-gradient(135deg, #0093e6 0%, #8fbce6 100%)",
    "linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)",
    "linear-gradient(135deg, #00cec9 0%, #55a3ff 100%)",
    "linear-gradient(135deg, #17ead9 0%, #6078ea 100%)",

    // Vibrant sunset gradients
    "linear-gradient(135deg, #f77062 0%, #fe5196 100%)",
    "linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)",
    "linear-gradient(135deg, #ff8a80 0%, #ff5722 100%)",
    "linear-gradient(135deg, #ff7675 0%, #fd79a8 100%)",
    "linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)",
    "linear-gradient(135deg, #fd79a8 0%, #fdcb6e 100%)",
    "linear-gradient(135deg, #e84393 0%, #f39c12 100%)",
    "linear-gradient(135deg, #ff6348 0%, #ffb142 100%)",

    // Professional dark gradients
    "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
    "linear-gradient(135deg, #232526 0%, #414345 100%)",
    "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
    "linear-gradient(135deg, #2c5364 0%, #203a43 100%)",
    "linear-gradient(135deg, #0f3460 0%, #0d2818 100%)",
    "linear-gradient(135deg, #134e5e 0%, #71b280 100%)",
    "linear-gradient(135deg, #1a2a6c 0%, #b21f1f 100%)",
    "linear-gradient(135deg, #141e30 0%, #243b55 100%)",

    // Rich tech gradients
    "linear-gradient(135deg, #667db6 0%, #0082c8 100%)",
    "linear-gradient(135deg, #f85032 0%, #e73827 100%)",
    "linear-gradient(135deg, #fba51a 0%, #f47068 100%)",
    "linear-gradient(135deg, #ff512f 0%, #dd2476 100%)",
    "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    "linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)",
    "linear-gradient(135deg, #4776e6 0%, #8e54e9 100%)",
    "linear-gradient(135deg, #9796f0 0%, #fbc7d4 100%)",

    // Bold modern gradients
    "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)",
    "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    "linear-gradient(135deg, #fdbb2d 0%, #22c1c3 100%)",
    "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
    "linear-gradient(135deg, #833ab4 0%, #fd1d1d 100%)",
    "linear-gradient(135deg, #fcb045 0%, #fd1d1d 100%)",
    "linear-gradient(135deg, #12c2e9 0%, #c471ed 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",

    // Deep jewel tones
    "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
    "linear-gradient(135deg, #ff7eb3 0%, #ff758c 100%)",
    "linear-gradient(135deg, #4568dc 0%, #b06ab3 100%)",
    "linear-gradient(135deg, #544a7d 0%, #ffd452 100%)",
    "linear-gradient(135deg, #7b4397 0%, #dc2430 100%)",
    "linear-gradient(135deg, #654ea3 0%, #eaafc8 100%)",
    "linear-gradient(135deg, #360033 0%, #0b8793 100%)",
    "linear-gradient(135deg, #6441a5 0%, #2a0845 100%)",

    // Rich earth tones
    "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
    "linear-gradient(135deg, #89fffd 0%, #ef32d9 100%)",
    "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    "linear-gradient(135deg, #92fe9d 0%, #00c9ff 100%)",
    "linear-gradient(135deg, #ff0099 0%, #493240 100%)",
    "linear-gradient(135deg, #009ffd 0%, #2a2a72 100%)",
    "linear-gradient(135deg, #eea2a2 0%, #bbc1bf 100%)",
    "linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)",

    // Neon cyber gradients
    "linear-gradient(135deg, #ff006e 0%, #8338ec 100%)",
    "linear-gradient(135deg, #06ffa5 0%, #0080ff 100%)",
    "linear-gradient(135deg, #ffbe0b 0%, #fb5607 100%)",
    "linear-gradient(135deg, #f72585 0%, #b5179e 100%)",
    "linear-gradient(135deg, #7209b7 0%, #480ca8 100%)",
    "linear-gradient(135deg, #f77f00 0%, #fcbf49 100%)",
    "linear-gradient(135deg, #f72585 0%, #4cc9f0 100%)",
    "linear-gradient(135deg, #7209b7 0%, #f72585 100%)",

    // Cosmic gradients
    "linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)",
    "linear-gradient(135deg, #1e1b4b 0%, #3730a3 100%)",
    "linear-gradient(135deg, #581c87 0%, #c026d3 100%)",
    "linear-gradient(135deg, #312e81 0%, #1e40af 100%)",
    "linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)",
    "linear-gradient(135deg, #be185d 0%, #ec4899 100%)",
    "linear-gradient(135deg, #166534 0%, #22c55e 100%)",
    "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)",

    // Retro wave gradients
    "linear-gradient(135deg, #ff0080 0%, #ff8c00 100%)",
    "linear-gradient(135deg, #00ffff 0%, #ff00ff 100%)",
    "linear-gradient(135deg, #8000ff 0%, #ff0080 100%)",
    "linear-gradient(135deg, #00ff80 0%, #0080ff 100%)",
    "linear-gradient(135deg, #ff4000 0%, #ff8000 100%)",
    "linear-gradient(135deg, #4000ff 0%, #8000ff 100%)",
    "linear-gradient(135deg, #ff0040 0%, #ff4080 100%)",
    "linear-gradient(135deg, #0040ff 0%, #4080ff 100%)",

    // Sunset beach gradients
    "linear-gradient(135deg, #f79d00 0%, #64f38c 100%)",
    "linear-gradient(135deg, #ad5389 0%, #3c1053 100%)",
    "linear-gradient(135deg, #636fa4 0%, #e8cbc0 100%)",
    "linear-gradient(135deg, #ff8177 0%, #ff867a 100%)",
    "linear-gradient(135deg, #f8cdda 0%, #1d2b64 100%)",
    "linear-gradient(135deg, #24fe41 0%, #fdbb2d 100%)",
    "linear-gradient(135deg, #ff5858 0%, #f857a6 100%)",
    "linear-gradient(135deg, #43cea2 0%, #185a9d 100%)",
  ];

  return gradients[Math.floor(Math.random() * gradients.length)];
};

export const configureAssistant = (
  voice: string,
  style: string,
  unit: [{ title: string; content: string }],
  topic: string
) => {
  const voiceId =
    voices[voice as keyof typeof voices][
      style as keyof (typeof voices)[keyof typeof voices]
    ] || "sarah";

  const vapiAssistant: CreateAssistantDTO = {
    name: "Companion",
    firstMessage: `Hello! Let's start the session on "${unit[0].title}". Here's what you'll learn: ${unit[0].content}`,
    transcriber: {
      provider: "deepgram",
      model: "nova-3",
      language: "en",
    },
    voice: {
      provider: "11labs",
      voiceId: voiceId,
      stability: 0.4,
      similarityBoost: 0.8,
      speed: 1,
      style: 0.5,
      useSpeakerBoost: true,
    },
    model: {
      provider: "openai",
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content: `You are a highly knowledgeable tutor teaching a real-time voice session with a student. Your goal is to teach the student about the topic and subject.

                    Tutor Guidelines:
                    Stick to the given topic - {{ topic }} and subject - {{ subject }} and teach the student about it.
                    Keep the conversation flowing smoothly while maintaining control.
                    From time to time make sure that the student is following you and understands you.
                    Break down the topic into smaller parts and teach the student one part at a time.
                    Keep your style of conversation {{ style }}.
                    Keep your responses short, like in a real voice conversation.
                    Do not include any special characters in your responses - this is a voice conversation.
              `,
        },
      ],
    },
    clientMessages: [],
    serverMessages: [],
  };
  return vapiAssistant;
};
