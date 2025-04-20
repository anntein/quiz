import { Question } from '@/types/quiz';
import questionsData from '../data/questions.json';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function shuffleQuestionAlternatives(question: Question): Question {
  const correctAlternative = question.alternatives.find(alt => alt.id === question.correctAnswerId);
  const otherAlternatives = question.alternatives.filter(alt => alt.id !== question.correctAnswerId);
  const shuffledOtherAlternatives = shuffleArray(otherAlternatives);
  
  // Randomly insert the correct answer
  const insertIndex = Math.floor(Math.random() * (shuffledOtherAlternatives.length + 1));
  const shuffledAlternatives = [
    ...shuffledOtherAlternatives.slice(0, insertIndex),
    correctAlternative!,
    ...shuffledOtherAlternatives.slice(insertIndex)
  ];
  
  return {
    ...question,
    alternatives: shuffledAlternatives,
    stats: {
      totalAttempts: 0,
      correctAttempts: 0,
      lastUpdated: Date.now()
    }
  };
}

export async function getQuestions(): Promise<Question[]> {
  const allQuestions = questionsData.questions as Question[];
  const selectedQuestions = shuffleArray(allQuestions).slice(0, 5);
  return selectedQuestions.map(shuffleQuestionAlternatives);
} 