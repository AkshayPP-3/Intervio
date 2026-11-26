import { env } from "../../config/env.js";
import appError from "../../utils/appError.js";

const SARVAM_BASE_URL = "https://api.sarvam.ai";

export const LANGUAGE_TO_SARVAM_CODE: Record<string, string> = {
  English: "en-IN",
  Hindi: "hi-IN",
  Kannada: "kn-IN",
  Tamil: "ta-IN",
  Telugu: "te-IN",
  Marathi: "mr-IN",
  Bengali: "bn-IN",
  Malayalam: "ml-IN",
  Gujarati: "gu-IN",
  Punjabi: "pa-IN",
};

export function resolveSarvamLanguageCode(languageOrCode?: string | null): string {
  if (!languageOrCode) return "en-IN";
  const trimmed = languageOrCode.trim();
  if (trimmed.includes("-")) return trimmed;
  return LANGUAGE_TO_SARVAM_CODE[trimmed] ?? "en-IN";
}

function assertSarvamKey(): string {
  if (!env.SARVAM_API_KEY) {
    throw new appError("SARVAM_API_KEY is not configured", 500);
  }
  return env.SARVAM_API_KEY;
}

export interface SarvamSTTInput {
  audioBuffer: Buffer;
  mimeType?: string;
  fileName?: string;
  language?: string | null;
}

export interface SarvamSTTResult {
  transcript: string;
  languageCode: string | null;
}

/** Transcribes spoken audio (English or Indian languages) using Sarvam AI STT. */
export async function transcribeAudioWithSarvam(
  input: SarvamSTTInput
): Promise<SarvamSTTResult> {
  const apiKey = assertSarvamKey();
  const languageCode = resolveSarvamLanguageCode(input.language);

  const form = new FormData();
  const safeMime = input.mimeType || "audio/webm";
  const safeName = input.fileName || "answer.webm";
  const blob = new Blob([new Uint8Array(input.audioBuffer)], { type: safeMime });
  form.append("file", blob, safeName);
  form.append("model", "saaras:v4");
  form.append("mode", "transcribe");
  form.append("language_code", languageCode);

  const response = await fetch(`${SARVAM_BASE_URL}/speech-to-text`, {
    method: "POST",
    headers: {
      "api-subscription-key": apiKey,
    },
    body: form,
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    console.error("Sarvam STT error:", response.status, errBody);
    throw new appError("Failed to transcribe speech with Sarvam AI", 502);
  }

  const data = (await response.json()) as {
    transcript?: string;
    language_code?: string | null;
  };

  return {
    transcript: (data.transcript ?? "").trim(),
    languageCode: data.language_code ?? languageCode,
  };
}

export interface SarvamTTSInput {
  text: string;
  languageCode?: string;
  speaker?: string;
}

export interface SarvamTTSResult {
  audioBase64: string;
  mimeType: string;
}

/** Converts English interviewer questions and reactions into spoken audio using Sarvam AI TTS. */
export async function synthesizeSpeechWithSarvam(
  input: SarvamTTSInput
): Promise<SarvamTTSResult> {
  const apiKey = assertSarvamKey();
  const text = input.text.trim().slice(0, 2400);
  if (!text) {
    throw new appError("Text is required for speech synthesis", 400);
  }

  const response = await fetch(`${SARVAM_BASE_URL}/text-to-speech`, {
    method: "POST",
    headers: {
      "api-subscription-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      language_code: input.languageCode ?? "en-IN",
      model: "bulbul:v3",
      speaker: input.speaker ?? "simran",
      pace: 1.0,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    console.error("Sarvam TTS error:", response.status, errBody);
    throw new appError("Failed to synthesize speech with Sarvam AI", 502);
  }

  const data = (await response.json()) as { audios?: string[] };
  const audioBase64 = data.audios?.[0];
  if (!audioBase64) {
    throw new appError("Sarvam AI returned no audio", 502);
  }

  return {
    audioBase64,
    mimeType: "audio/wav",
  };
}
