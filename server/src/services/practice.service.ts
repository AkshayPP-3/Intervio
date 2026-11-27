import {
  evaluatePracticeAnswers as evaluateWithGemini,
  generatePracticeQuestions as generateWithGemini,
} from "./ai/gemini.service.js";
import appError from "../utils/appError.js";

type PracticeAnswer = {
  question: string;
  userAnswer: string;
};

export const generatePracticeQuestions = async (topic: string, count: number) => {
  const generated = await generateWithGemini({ topic, count });
  return generated.map((question) => ({ question }));
};

export const evaluatePracticeAnswers = async (
  topic: string,
  answers: PracticeAnswer[],
) => {
  const evaluations = await evaluateWithGemini({ topic, answers });
  return answers.map((answer, index) => {
    const evaluation = evaluations[index];
    if (!evaluation) {
      throw new appError("Practice evaluation did not return a result for every answer", 502);
    }
    return {
      ...answer,
      idealAnswer: evaluation.idealAnswer,
      score: evaluation.score,
      feedback: evaluation.feedback,
    };
  });
};
