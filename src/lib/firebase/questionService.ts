import { doc, updateDoc, increment, serverTimestamp, getDoc, setDoc } from 'firebase/firestore';
import { db } from './config';
import { Question, QuestionStats } from '@/types/quiz';

export const updateQuestionStats = async (
  questionId: string,
  isCorrect: boolean
): Promise<void> => {
  const questionRef = doc(db, 'questions', questionId);
  const questionDoc = await getDoc(questionRef);
  
  if (!questionDoc.exists()) {
    // Create the question document with initial stats
    await setDoc(questionRef, {
      stats: {
        totalAttempts: 1,
        correctAttempts: isCorrect ? 1 : 0,
        lastUpdated: serverTimestamp(),
      }
    });
  } else {
    // Update existing stats
    await updateDoc(questionRef, {
      'stats.totalAttempts': increment(1),
      'stats.correctAttempts': increment(isCorrect ? 1 : 0),
      'stats.lastUpdated': serverTimestamp(),
    });
  }
};

export const getQuestionStats = async (questionId: string): Promise<QuestionStats | null> => {
  const questionRef = doc(db, 'questions', questionId);
  const questionDoc = await getDoc(questionRef);
  
  if (!questionDoc.exists()) {
    return null;
  }
  
  const question = questionDoc.data() as Question;
  return question.stats;
}; 