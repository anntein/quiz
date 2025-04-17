'use client';

import { useState, useEffect } from 'react';
import HomeView from '@/components/HomeView';
import JoinQuizView from '@/components/JoinQuizView';
import NicknameEntry from '@/components/NicknameEntry';
import QuestionView from '@/components/QuestionView';
import ResultsView from '@/components/ResultsView';
import { getQuestions } from '@/lib/questions';
import { Question } from '@/lib/types';
import { signIn, onAuthStateChange } from '@/lib/firebase/authService';
import { createQuiz, joinQuiz, submitScore, getLeaderboard, getQuiz } from '@/lib/firebase/quizService';
import { auth } from '@/lib/firebase/config';
import { saveLastNickname, getLastNickname } from '@/utils/storage';
import { TIME_LIMIT } from '@/lib/constants';
import { TIME_BONUS_RATE } from '@/lib/constants';

type ViewState = 'home' | 'join' | 'nickname' | 'question' | 'results';

interface QuizState {
  quizId: string;
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  timeBasedScore: number;
  questionStartTime: number;
  timeLimit: number;
  questionScores: {
    accuracy: number;
    timeBonus: number;
  }[];
  currentPlayer: {
    userId: string;
    nickname: string;
    score: number;
  };
}

interface ExtendedQuizState {
  quizId: string;
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  timeBasedScore: number;
  questionStartTime: number;
  timeLimit: number;
  questionScores: {
    accuracy: number;
    timeBonus: number;
  }[];
  currentPlayer: {
    userId: string;
    nickname: string;
    score: number;
  };
  timeRemaining: number;
}

const ACCURACY_POINTS = 100;

const calculateQuestionScore = (
  isCorrect: boolean,
  timeSpent: number
): { accuracy: number; timeBonus: number } => {
  const accuracyScore = isCorrect ? ACCURACY_POINTS : 0;
  const timeRemaining = Math.max(0, TIME_LIMIT - timeSpent);
  const timeBonus = Math.floor(timeRemaining * TIME_BONUS_RATE);
  
  return {
    accuracy: accuracyScore,
    timeBonus: timeBonus
  };
};

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>('home');
  const [quizState, setQuizState] = useState<ExtendedQuizState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEmoji, setShowEmoji] = useState(false);

  useEffect(() => {
    // Initialize Firebase auth
    const unsubscribe = onAuthStateChange(async (user) => {
      if (!user) {
        await signIn();
      }
    });

    // Check for join parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const joinQuizId = urlParams.get('join');
    if (joinQuizId) {
      handleJoinQuiz(joinQuizId);
    }

    const lastNickname = getLastNickname();
    if (lastNickname && quizState) {
      setQuizState({
        ...quizState,
        currentPlayer: {
          ...quizState.currentPlayer,
          nickname: lastNickname
        },
        timeRemaining: TIME_LIMIT
      });
      setViewState('question');
    }

    return () => unsubscribe();
  }, []);

  const startNewQuiz = async () => {
    try {
      const response = await fetch('/api/questions');
      const questions = await response.json();
      
      // Create the quiz in Firestore
      const quizId = await createQuiz(questions);
      
      setQuizState({
        quizId,
        questions,
        currentQuestionIndex: 0,
        score: 0,
        timeBasedScore: 0,
        questionStartTime: 0,
        timeLimit: TIME_LIMIT,
        questionScores: [],
        currentPlayer: {
          userId: auth.currentUser?.uid || '',
          nickname: '',
          score: 0
        },
        timeRemaining: TIME_LIMIT
      });
      setViewState('nickname');
    } catch (error) {
      console.error('Failed to create quiz:', error);
      setError('Failed to create quiz. Please try again.');
    }
  };

  const handleJoinQuiz = async (quizId: string) => {
    try {
      const quiz = await getQuiz(quizId);
      
      if (quiz) {
        setQuizState({
          quizId: quiz.id,
          questions: quiz.questions,
          currentQuestionIndex: 0,
          score: 0,
          timeBasedScore: 0,
          questionStartTime: 0,
          timeLimit: TIME_LIMIT,
          questionScores: [],
          currentPlayer: {
            userId: auth.currentUser?.uid || '',
            nickname: '',
            score: 0
          },
          timeRemaining: TIME_LIMIT
        });
        setViewState('nickname');
      } else {
        setError('Quiz not found');
      }
    } catch (error) {
      console.error('Failed to join quiz:', error);
      setError('Failed to join quiz. Please try again.');
    }
  };

  const handleNicknameSubmit = async (nickname: string) => {
    if (!quizState) return;

    try {
      // Save the nickname for future use
      saveLastNickname(nickname);
      
      // Join the quiz with the nickname
      await joinQuiz(quizState.quizId, nickname);
      
      // Update the quiz state with the nickname
      setQuizState({
        ...quizState,
        currentPlayer: {
          ...quizState.currentPlayer,
          nickname
        },
        timeRemaining: TIME_LIMIT
      });
      
      setViewState('question');
    } catch (error) {
      console.error('Failed to join quiz:', error);
      setError('Failed to join quiz. Please try again.');
    }
  };

  const handleAnswerSubmit = async (answerId: string, timeSpent: number) => {
    if (!quizState) return;

    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    const isCorrect = currentQuestion.correctAnswerId === answerId;
    const nextQuestionIndex = quizState.currentQuestionIndex + 1;
    
    const questionScore = calculateQuestionScore(isCorrect, timeSpent);
    const totalScore = questionScore.accuracy + questionScore.timeBonus;
    
    const newState = {
      ...quizState,
      score: quizState.score + (isCorrect ? 1 : 0),
      timeBasedScore: quizState.timeBasedScore + totalScore,
      questionScores: [...quizState.questionScores, questionScore],
      currentQuestionIndex: nextQuestionIndex,
      timeRemaining: quizState.timeRemaining - timeSpent
    };
    
    setQuizState(newState);
    
    if (nextQuestionIndex >= quizState.questions.length) {
      try {
        await submitScore(quizState.quizId, newState.timeBasedScore, newState.currentPlayer.nickname);
        setViewState('results');
      } catch (error) {
        console.error('Failed to submit score:', error);
        setError('Failed to submit score. Please try again.');
      }
    }
  };

  const returnHome = () => {
    setViewState('home');
    setShowEmoji(false);
    setQuizState({
      quizId: '',
      questions: [],
      currentQuestionIndex: 0,
      score: 0,
      timeBasedScore: 0,
      questionStartTime: 0,
      timeLimit: TIME_LIMIT,
      questionScores: [],
      currentPlayer: {
        userId: '',
        nickname: '',
        score: 0
      },
      timeRemaining: TIME_LIMIT
    });
  };

  const onJoinQuiz = async (quizId?: string) => {
    if (quizId) {
      try {
        const quiz = await getQuiz(quizId);
        if (quiz) {
          setQuizState({
            quizId: quiz.id,
            questions: quiz.questions,
            currentQuestionIndex: 0,
            score: 0,
            timeBasedScore: 0,
            questionStartTime: 0,
            timeLimit: TIME_LIMIT,
            questionScores: [],
            currentPlayer: {
              userId: '',
              nickname: '',
              score: 0
            },
            timeRemaining: TIME_LIMIT
          });
          setViewState('question');
        } else {
          setError('Quiz not found');
        }
      } catch (error) {
        setError('Failed to join quiz');
      }
    } else {
      setViewState('join');
    }
  };

  return (
    <div className="min-h-screen bg-[#B5E0D6]">
      {viewState === 'home' && (
        <HomeView 
          onNewQuiz={startNewQuiz}
          onJoinQuiz={() => setViewState('join')}
        />
      )}
      {viewState === 'join' && (
        <JoinQuizView
          onJoinQuiz={handleJoinQuiz}
          onBack={() => setViewState('home')}
        />
      )}
      {viewState === 'nickname' && (
        <NicknameEntry
          onSubmit={handleNicknameSubmit}
          onBack={() => setViewState('home')}
        />
      )}
      {viewState === 'question' && quizState && quizState.questions.length > 0 && quizState.currentQuestionIndex < quizState.questions.length && (
        <QuestionView
          question={quizState.questions[quizState.currentQuestionIndex]}
          onAnswer={handleAnswerSubmit}
          currentQuestionNumber={quizState.currentQuestionIndex + 1}
          totalQuestions={quizState.questions.length}
          showEmoji={false}
          timeLimit={TIME_LIMIT}
        />
      )}
      {viewState === 'results' && quizState && (
        <ResultsView
          quizId={quizState.quizId}
          score={quizState.score}
          totalQuestions={quizState.questions.length}
          onReturnHome={() => {
            setViewState('home');
            setQuizState({
              quizId: '',
              questions: [],
              currentQuestionIndex: 0,
              score: 0,
              timeBasedScore: 0,
              questionStartTime: 0,
              timeLimit: TIME_LIMIT,
              questionScores: [],
              currentPlayer: {
                userId: '',
                nickname: '',
                score: 0
              },
              timeRemaining: TIME_LIMIT
            });
          }}
          questionScores={quizState.questionScores}
          currentNickname={quizState.currentPlayer.nickname}
        />
      )}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
