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

export enum QuizView {
  HOME = 'home',
  NICKNAME_ENTRY = 'nickname',
  QUESTION = 'question',
  RESULTS = 'results'
}

export interface QuizCache {
  questions: Question[];
  lastGenerated: number;
}

export interface QuizState {
  view: QuizView;
  quizId: string | null;
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  timeBasedScore: number;
  currentPlayer: {
    nickname: string;
    score: number;
    timeBasedScore: number;
  } | null;
  participants: Record<string, {
    nickname: string;
    score: number;
    timeBasedScore: number;
  }>;
  isActive: boolean;
  createdAt: Date;
  totalParticipants: number;
  userRank: {
    position: number;
    score: number;
  } | null;
} 