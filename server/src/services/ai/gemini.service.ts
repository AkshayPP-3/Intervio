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
      model: "gemini-3.8-flash",
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
  }catch (error: any) {
      if (error instanceof appError) {
        throw error;
      }
      console.error("Gemini API error:", error);
      if (error?.status === 503) {
        throw new appError(
          "Gemini is temporarily unavailable. Please try again in a moment.",
          503
        );
      }
      if (error?.status === 429) {
        throw new appError(
          "Gemini API rate limit reached. Please try again later.",
          429
        );
      }

    if (error?.status === 401 || error?.status === 403) {
      throw new appError(
        "Gemini API authentication failed.",
        502
      );
    }

    throw new appError(
      "Failed to generate AI response",
      502
    );
  }
}
interface InterviewQuestion {
  questionText: string;
  questionType: string;
  order: number;
}

interface GenerateInterviewQuestionsData {
  role: string;
  difficulty?: string;
  language?: string;
}

export const generateInterviewQuestions = async (
  data: GenerateInterviewQuestionsData
): Promise<InterviewQuestion[]> => {
  try {
    const prompt = `
Generate 5 interview questions for a mock interview.

Role: ${data.role}
Difficulty: ${data.difficulty ?? "Medium"}
Language: ${data.language ?? "English"}

Requirements:
- Questions should be relevant to the role.
- Mix conceptual and practical questions.
- Questions should be suitable for an interview.
- Return exactly 5 questions.
- Return ONLY valid JSON.
- Do not include markdown or code fences.

Return this exact format:

[
  {
    "questionText": "Question here",
    "questionType": "TECHNICAL",
    "order": 1
  }
]
`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    const text = response.text;

    if (!text) {
      throw new appError(
        "Gemini returned an empty response",
        502
      );
    }

    const questions: InterviewQuestion[] = JSON.parse(text);

    return questions;
  } catch (error) {
    if (error instanceof appError) {
      throw error;
    }

    console.error("Gemini question generation error:", error);

    throw new appError(
      "Failed to generate interview questions",
      502
    );
  }
};
interface InterviewEvaluationQuestion {
  question: string;
  answer: string;
}

interface EvaluateInterviewData {
  role: string;
  difficulty?: string | null;
  language?: string | null;
  questions: InterviewEvaluationQuestion[];
}

interface InterviewEvaluationResult {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
}

export const evaluateInterview = async (
  data: EvaluateInterviewData
): Promise<InterviewEvaluationResult> => {
  try {
    const prompt = `
You are an AI interviewer evaluating a candidate's complete mock interview.

Interview Details:
Role: ${data.role}
Difficulty: ${data.difficulty ?? "Medium"}
Language: ${data.language ?? "English"}

Interview Questions and Candidate Answers:

${data.questions
  .map(
    (item, index) => `
Question ${index + 1}:
${item.question}

Candidate Answer:
${item.answer}
`
  )
  .join("\n")}

Evaluate the candidate based on:

1. Technical knowledge
2. Communication quality
3. Confidence demonstrated through the answers
4. Overall interview performance

Scoring:
- overallScore: 0 to 100
- technicalScore: 0 to 100
- communicationScore: 0 to 100
- confidenceScore: 0 to 100

Also provide:
- concise overall feedback
- key strengths
- key weaknesses

Return ONLY valid JSON.

Do not use markdown.
Do not use code fences.
Do not include any text outside the JSON.

Return exactly this structure:

{
  "overallScore": 0,
  "technicalScore": 0,
  "communicationScore": 0,
  "confidenceScore": 0,
  "feedback": "",
  "strengths": [],
  "weaknesses": []
}
`;

    const response = await gemini.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
    });

    const text = response.text;

    if (!text) {
      throw new appError(
        "Gemini returned an empty response",
        502
      );
    }

    const evaluation: InterviewEvaluationResult = JSON.parse(text);

    return evaluation;
  } catch (error) {
    if (error instanceof appError) {
      throw error;
    }

    console.error(
      "Gemini interview evaluation error:",
      error
    );

    throw new appError(
      "Failed to evaluate interview",
      502
    );
  }
};