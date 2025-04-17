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

export interface RecentQuiz {
  id: string;
  name: string;  // Generated from quiz ID (e.g., "Happy Quiz 123")
  createdAt: Timestamp;
  totalParticipants: number;
  userRank?: {
    position: number;
    score: number;
    totalParticipants: number;
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
  score: number,
  nickname: string
): Promise<void> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated to submit a score');
  }

  const quizRef = doc(db, 'quizzes', quizId);
  const quizDoc = await getDoc(quizRef);
  
  if (!quizDoc.exists()) {
    throw new Error('Quiz not found');
  }
  
  const quiz = quizDoc.data() as Quiz;
  
  // If user hasn't joined the quiz yet, join them first
  if (!quiz.participants[user.uid]) {
    await updateDoc(quizRef, {
      [`participants.${user.uid}`]: {
        nickname,
        score: 0,
        joinedAt: serverTimestamp()
      }
    });
  }
  
  // Update the score and completion time
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

export const getRecentQuizzes = async (limitCount: number = 10): Promise<RecentQuiz[]> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User must be authenticated');
  }

  const quizzesRef = collection(db, 'quizzes');
  const q = query(
    quizzesRef,
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  const quizzes: RecentQuiz[] = [];

  for (const doc of snapshot.docs) {
    const data = doc.data() as Quiz;
    const participants = Object.entries(data.participants || {});
    const userParticipation = participants.find(([uid]) => uid === user.uid);
    
    // Sort participants by score to determine user's rank
    const sortedParticipants = participants
      .sort(([, a], [, b]) => b.score - a.score);
    
    const userRank = userParticipation ? {
      position: sortedParticipants.findIndex(([uid]) => uid === user.uid) + 1,
      score: userParticipation[1].score,
      totalParticipants: participants.length
    } : undefined;

    // Convert quiz ID to readable name
    const idParts = doc.id.split('-');
    const name = idParts
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    quizzes.push({
      id: doc.id,
      name,
      createdAt: data.createdAt,
      totalParticipants: participants.length,
      userRank
    });
  }

  return quizzes;
}; 