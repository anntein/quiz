import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from './config';
import { Question } from '@/types/quiz';

export interface Quiz {
  id: string;
  questions: Question[];
  createdAt: Timestamp;
  isActive: boolean;
  createdBy: string;
  participants: {
    [userId: string]: {
      nickname: string;
      score: number;
      joinedAt: Timestamp;
      completedAt?: Timestamp;
    };
  };
}

const generateQuizId = (): string => {
  const adjectives = ['happy', 'clever', 'quick', 'brave', 'wise', 'funny', 'smart', 'cool'];
  const nouns = ['quiz', 'game', 'test', 'challenge', 'match', 'battle', 'duel', 'race'];
  const numbers = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  
  return `${randomAdjective}-${randomNoun}-${numbers}`;
};

export const createQuiz = async (questions: Question[]): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated to create a quiz');
  }

  const quizId = generateQuizId();
  const quizRef = doc(db, 'quizzes', quizId);
  const quiz: Omit<Quiz, 'id'> = {
    questions,
    createdAt: serverTimestamp() as Timestamp,
    isActive: true,
    createdBy: user.uid,
    participants: {}
  };
  
  await setDoc(quizRef, quiz);
  return quizId;
};

export const getQuiz = async (quizId: string): Promise<Quiz | null> => {
  const quizRef = doc(db, 'quizzes', quizId);
  const quizDoc = await getDoc(quizRef);
  
  if (!quizDoc.exists()) {
    return null;
  }
  
  return {
    id: quizDoc.id,
    ...quizDoc.data()
  } as Quiz;
};

export const joinQuiz = async (quizId: string, nickname: string): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated to join a quiz');
  }

  const quizRef = doc(db, 'quizzes', quizId);
  const quizDoc = await getDoc(quizRef);
  
  if (!quizDoc.exists()) {
    return false;
  }
  
  const quiz = quizDoc.data() as Quiz;
  
  // Check if user is already a participant
  if (quiz.participants[user.uid]) {
    return false;
  }
  
  // Add participant
  await updateDoc(quizRef, {
    [`participants.${user.uid}`]: {
      nickname,
      score: 0,
      joinedAt: serverTimestamp()
    }
  });
  
  return true;
};

export const submitScore = async (
  quizId: string, 
  score: number
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated to submit a score');
  }

  const quizRef = doc(db, 'quizzes', quizId);
  
  await updateDoc(quizRef, {
    [`participants.${user.uid}.score`]: score,
    [`participants.${user.uid}.completedAt`]: serverTimestamp()
  });
};

export const getLeaderboard = async (quizId: string): Promise<Array<{
  nickname: string;
  score: number;
}>> => {
  const quizRef = doc(db, 'quizzes', quizId);
  const quizDoc = await getDoc(quizRef);
  
  if (!quizDoc.exists()) {
    return [];
  }
  
  const quiz = quizDoc.data() as Quiz;
  const participants = Object.entries(quiz.participants)
    .map(([_, data]) => ({
      nickname: data.nickname,
      score: data.score
    }))
    .sort((a, b) => b.score - a.score);
  
  return participants;
};

export const isQuizActive = async (quizId: string): Promise<boolean> => {
  const quizRef = doc(db, 'quizzes', quizId);
  const quizDoc = await getDoc(quizRef);
  
  if (!quizDoc.exists()) {
    return false;
  }
  
  const quiz = quizDoc.data() as Quiz;
  return quiz.isActive;
}; 