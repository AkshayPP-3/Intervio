import { GoogleGenAI } from "@google/genai";
import appError from "../../utils/appError.js";
import {env} from "../../config/env.js"

const gemini = new GoogleGenAI({
  apiKey:env.GEMINI_API_KEY,
});

interface ChatHistoryMessage {
  role: "USER" | "ASSISTANT";
  content: string;
}

export const generateChatResponse = async (
  messages: ChatHistoryMessage[]
): Promise<string> => {
  try {
    const contents = messages.map((message) => ({
      role: message.role === "USER" ? "user" : "model",
      parts: [
        {
          text: message.content,
        },
      ],
    }));

    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction:
          "You are Intervio AI, an AI assistant for interview preparation. " +
          "Help users understand technical concepts, prepare for interviews, " +
          "practice questions, and improve their answers. " +
          "Be clear, helpful, and concise.",
      },
    });

    const text = response.text;

    if (!text) {
      throw new appError("Gemini returned an empty response", 502);
    }

    return text;
  } catch (error) {
    if (error instanceof appError) {
      throw error;
    }

    console.error("Gemini API error:", error);

    throw new appError(
      "Failed to generate AI response",
      502
    );
  }
};