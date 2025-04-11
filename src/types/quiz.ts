export interface Alternative {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  alternatives: Alternative[];
  correctAnswerId: string;
}

export interface QuestionScore {
  questionId: string;
  accuracy: number;
  timeBonus: number;
}

export interface PlayerScore {
  userId: string;
  nickname: string;
  totalScore: number;
  questionScores: QuestionScore[];
  timestamp: number;
}

export interface QuizState {
  quizId: string;
  currentQuestionIndex: number;
  questions: Question[];
  selectedAnswer: number | null;
  isTimeout: boolean;
  questionScores: QuestionScore[];
  playerScores: PlayerScore[];
  currentPlayer: {
    userId: string;
    nickname: string;
    score: number;
  };
}

export type QuizView = 'home' | 'join' | 'nickname' | 'question' | 'results';

export interface Quiz {
  id: string;
  questions: Question[];
  createdAt: number;
  isActive: boolean;
  createdBy: string;
  participants: {
    [userId: string]: {
      nickname: string;
      score: number;
      joinedAt: number;
      completedAt?: number;
    };
  };
} 