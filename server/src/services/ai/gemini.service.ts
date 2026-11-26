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

const GEMINI_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3-flash-preview",
  "gemini-3.8-flash",
] as const;

function parseJsonResponse<T>(raw: string): T {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  return JSON.parse(cleaned) as T;
}

async function generateWithFallback(
  params: Omit<Parameters<typeof gemini.models.generateContent>[0], "model">
) {
  let lastError: unknown;
  for (const model of GEMINI_MODELS) {
    try {
      return await gemini.models.generateContent({ ...params, model });
    } catch (error: any) {
      lastError = error;
      const status = error?.status;
      if (status === undefined || status === 503 || status === 429 || status === 404) {
        console.warn(`Gemini model ${model} failed (${status ?? "network"}), trying fallback...`);
        continue;
      }
      throw error;
    }
  }
  throw lastError;
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

    const response = await generateWithFallback({
      contents,
      config: {
        systemInstruction:
          "You are Intervio AI, a strict interview preparation and career coaching assistant. " +
          "You ONLY answer questions about job interview preparation, technical interview topics " +
          "(e.g., Frontend, Backend, Full Stack, DSA, System Design, Databases, DevOps, HR/Behavioural rounds, Aptitude), " +
          "resume/portfolio improvement, and interview communication or confidence. " +
          "You can understand messages in English or any Indian language, and reply clearly and concisely. " +
          "STRICT TOPIC RULE: If the user asks about anything unrelated to interview preparation, technical job skills, or career coaching " +
          "(such as movies, sports, politics, cooking, jokes, general trivia, or unrelated personal chat), " +
          "politely refuse in 1-2 sentences and ask them to return to interview preparation topics. Never answer off-topic requests.",
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

Role / Topic: ${data.role}
Difficulty: ${data.difficulty ?? "Medium"}

Requirements:
- Every question MUST be written strictly in clear, natural English. Never translate questions into any other language.
- Every question MUST stay strictly focused on the role/topic "${data.role}". Do not ask unrelated topics.
- Mix conceptual and practical scenario questions appropriate for ${data.difficulty ?? "Medium"} level.
- Return exactly 5 questions.
- Return ONLY valid JSON (no markdown, no code fences).

Return this exact format:

[
  {
    "questionText": "Question here",
    "questionType": "TECHNICAL",
    "order": 1
  }
]
`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction:
          `You are a strict technical/HR interviewer for "${data.role}". ` +
          "Always generate interview questions strictly in English and strictly within the chosen role/topic.",
      },
    });

    const text = response.text;

    if (!text) {
      throw new appError(
        "Gemini returned an empty response",
        502
      );
    }

    const questions = parseJsonResponse<InterviewQuestion[]>(text);

    return questions;
  } catch (error: any) {
    if (error instanceof appError) {
      throw error;
    }

    console.error("Gemini question generation error:", error);
    if (error?.status === 503) {
      throw new appError("Gemini is temporarily busy. Please try again in a moment.", 503);
    }
    if (error?.status === 429) {
      throw new appError("Gemini API rate limit reached. Please try again later.", 429);
    }

    throw new appError(
      "Failed to generate interview questions",
      502
    );
  }
};

interface ReactToAnswerData {
  role: string;
  difficulty?: string | null;
  candidateLanguage?: string | null;
  questionText: string;
  answerText: string;
  isLastQuestion?: boolean;
}

/** Generates a natural English HR/interviewer reaction to an answer (including Indian-language answers). */
export const reactToInterviewAnswer = async (
  data: ReactToAnswerData
): Promise<string> => {
  try {
    const transitionHint = data.isLastQuestion
      ? "End by thanking them and letting them know we are ready for their final evaluation."
      : "End with a natural 1-clause transition to the next question.";

    const prompt = `
Interview Topic / Role: ${data.role}
Difficulty: ${data.difficulty ?? "Medium"}
Candidate's preferred spoken language: ${data.candidateLanguage ?? "English"}

Question asked (in English):
${data.questionText}

Candidate's answer (may be in English, ${data.candidateLanguage ?? "an Indian language"}, or code-mixed):
${data.answerText}

Respond as the live interviewer in 2-3 short, natural spoken sentences in English:
1. Understand the candidate's answer even if it is in an Indian language or transliterated.
2. React encouragingly like a real interviewer: briefly acknowledge what was good, or gently point out a key concept/correction if something was missing.
3. Stay strictly on the topic "${data.role}". If the candidate went off-topic or asked something unrelated to "${data.role}", politely bring them back on topic without answering the off-topic query.
4. ${transitionHint}
`;

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        systemInstruction:
          `You are an encouraging, realistic live mock interviewer conducting an interview strictly on "${data.role}". ` +
          "You understand answers in English and all Indian languages, but you ALWAYS speak and reply ONLY in clear, natural English. " +
          "Keep replies concise (2-3 spoken sentences, plain text without markdown) so they work smoothly as live subtitles and voice.",
      },
    });

    const text = response.text?.trim();
    if (!text) {
      throw new appError("Gemini returned an empty reaction", 502);
    }
    return text;
  } catch (error) {
    console.error("Gemini reaction error:", error);
    return data.isLastQuestion
      ? "Thank you for sharing your answer. Let's wrap up and review your evaluation."
      : "Thank you for that response. Let's move on to the next question.";
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

Evaluate the candidate strictly for the role "${data.role}" based on:

1. Technical knowledge (understand the meaning accurately even if the candidate answered in ${data.language ?? "English"} or mixed Indian language/English)
2. Communication quality (clarity and structure of thought, regardless of whether answered in English or their mother tongue)
3. Confidence demonstrated through the answers
4. Overall interview performance

Write all evaluation feedback, strengths, and weaknesses in clear English.

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

    const response = await generateWithFallback({
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction:
          `You are an AI interviewer evaluating a candidate strictly for "${data.role}". ` +
          "You understand answers in English and all Indian languages, and return structured JSON feedback in English.",
      },
    });

    const text = response.text;

    if (!text) {
      throw new appError(
        "Gemini returned an empty response",
        502
      );
    }

    const evaluation = parseJsonResponse<InterviewEvaluationResult>(text);

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