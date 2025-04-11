import { Question } from './types';
import questionsData from '@/data/questions.json';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function getQuestions(): Promise<Question[]> {
  const allQuestions = questionsData.questions as Question[];
  return shuffleArray(allQuestions).slice(0, 5);
} 