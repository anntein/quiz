import { PlayerScore, QuestionScore } from '../types/quiz';

const SCORES_KEY = 'quiz_high_scores';
const ACCURACY_POINTS = 100;
const TIME_BONUS_RATE = 10;

export const getHighScores = (): PlayerScore[] => {
  if (typeof window === 'undefined') return [];
  const scores = localStorage.getItem(SCORES_KEY);
  return scores ? JSON.parse(scores) : [];
};

export const saveHighScore = (score: PlayerScore): void => {
  if (typeof window === 'undefined') return;
  const scores = getHighScores();
  scores.push(score);
  scores.sort((a, b) => b.totalScore - a.totalScore);
  localStorage.setItem(SCORES_KEY, JSON.stringify(scores.slice(0, 10))); // Keep top 10 scores
};

export const calculateScore = (isCorrect: boolean, timeRemaining: number): number => {
  const accuracyScore = isCorrect ? ACCURACY_POINTS : 0;
  const timeBonus = Math.floor(timeRemaining * TIME_BONUS_RATE);
  return accuracyScore + timeBonus;
};

export const calculateQuestionScore = (
  questionId: string,
  isCorrect: boolean,
  timeRemaining: number
): QuestionScore => {
  const accuracy = isCorrect ? 1 : 0;
  const timeBonus = Math.round((timeRemaining / 10) * 100) / 100; // Round to 2 decimal places
  return {
    questionId,
    accuracy,
    timeBonus,
  };
}; 