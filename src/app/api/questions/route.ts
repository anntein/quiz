import { NextResponse } from 'next/server';
import questionsData from '@/data/questions.json';

// Fisher-Yates shuffle algorithm
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export async function GET() {
  // Get all questions and shuffle them
  const allQuestions = questionsData.questions;
  const selectedQuestions = shuffleArray(allQuestions).slice(0, 5);

  // Shuffle alternatives for each question while preserving the correct answer ID
  const shuffledQuestions = selectedQuestions.map(question => {
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
      alternatives: shuffledAlternatives
    };
  });

  return NextResponse.json(shuffledQuestions);
} 