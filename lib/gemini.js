import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in environment variables");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateContent(prompt) {
  try {
    if (!prompt || prompt.trim().length === 0) {
      throw new Error("Prompt cannot be empty");
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // or "gpt-3.5-turbo"
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that returns clean HTML based on user input.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 5000,
    });

    const result = response.choices[0]?.message?.content;

    if (!result) {
      throw new Error("No content generated");
    }

    return result;
  } catch (error) {
    console.error("Error generating content:", error);

    // Specific error handling
    if (error.code === "rate_limit_exceeded") {
      throw new Error("OpenAI rate limit exceeded. Please try again later.");
    } else if (error.code === "invalid_api_key") {
      throw new Error("Invalid OpenAI API key.");
    }

    throw error;
  }
}
