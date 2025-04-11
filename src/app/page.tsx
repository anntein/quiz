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
import { saveLastNickname, getLastNickname } from '@/utils/storage';

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
}

const TIME_LIMIT = 30; // seconds per question
const ACCURACY_POINTS = 100;
const TIME_BONUS_RATE = 10;

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
  const [view, setView] = useState<'home' | 'join' | 'nickname' | 'question' | 'results'>('home');
  const [showEmoji, setShowEmoji] = useState(false);
  const [quizState, setQuizState] = useState<ExtendedQuizState>({
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
    }
  });

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

    return () => unsubscribe();
  }, []);

  const startNewQuiz = async () => {
    try {
      const questions = await getQuestions();
      const quizId = await createQuiz(questions);
      
      const lastNickname = getLastNickname();
      if (lastNickname) {
        // If we have a saved nickname, try to join directly
        const success = await joinQuiz(quizId, lastNickname);
        if (success) {
          setQuizState({
            ...quizState,
            quizId,
            questions,
            currentQuestionIndex: 0,
            score: 0,
            timeBasedScore: 0,
            questionStartTime: 0,
            questionScores: [],
            currentPlayer: {
              ...quizState.currentPlayer,
              nickname: lastNickname
            }
          });
          setView('question');
          return;
        }
      }

      // If no saved nickname or join failed, show nickname entry
      setQuizState({
        ...quizState,
        quizId,
        questions,
        currentQuestionIndex: 0,
        score: 0,
        timeBasedScore: 0,
        questionStartTime: 0,
        questionScores: []
      });
      setView('nickname');
    } catch (error) {
      console.error('Failed to create quiz:', error);
      alert('Failed to create quiz. Please try again.');
    }
  };

  const handleJoinQuiz = async (quizId: string) => {
    try {
      const quiz = await getQuiz(quizId);
      if (!quiz) {
        alert('Quiz not found');
        return;
      }

      const lastNickname = getLastNickname();
      if (lastNickname) {
        // If we have a saved nickname, try to join directly
        const success = await joinQuiz(quizId, lastNickname);
        if (success) {
          setQuizState({
            ...quizState,
            quizId,
            questions: quiz.questions,
            currentQuestionIndex: 0,
            score: 0,
            timeBasedScore: 0,
            questionStartTime: 0,
            questionScores: [],
            currentPlayer: {
              ...quizState.currentPlayer,
              nickname: lastNickname
            }
          });
          setView('question');
          return;
        }
      }

      // If no saved nickname or join failed, show nickname entry
      setQuizState({
        ...quizState,
        quizId,
        questions: quiz.questions,
        currentQuestionIndex: 0,
        score: 0,
        timeBasedScore: 0,
        questionStartTime: 0,
        questionScores: []
      });
      setView('nickname');
    } catch (error) {
      console.error('Failed to join quiz:', error);
      alert('Failed to join quiz. Please try again.');
    }
  };

  const handleNicknameSubmit = async (nickname: string) => {
    try {
      const success = await joinQuiz(quizState.quizId, nickname);
      if (!success) {
        alert('Failed to join quiz. The quiz might be full or no longer active.');
        return;
      }

      // Save the nickname for future use
      saveLastNickname(nickname);

      setQuizState({
        ...quizState,
        currentPlayer: {
          ...quizState.currentPlayer,
          nickname
        }
      });
      setView('question');
    } catch (error) {
      console.error('Failed to join quiz:', error);
      alert('Failed to join quiz. Please try again.');
    }
  };

  const handleAnswer = async (answerId: string, timeSpent: number) => {
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    const isCorrect = answerId === currentQuestion.correctAnswerId;
    
    const questionScore = calculateQuestionScore(isCorrect, timeSpent);
    const totalScore = questionScore.accuracy + questionScore.timeBonus;
    
    const nextQuestionIndex = quizState.currentQuestionIndex + 1;
    const isLastQuestion = nextQuestionIndex >= quizState.questions.length;
    
    const newState = {
      ...quizState,
      score: quizState.score + (isCorrect ? 1 : 0),
      timeBasedScore: quizState.timeBasedScore + totalScore,
      questionScores: [...quizState.questionScores, questionScore],
      currentQuestionIndex: nextQuestionIndex
    };
    
    setQuizState(newState);

    if (isLastQuestion) {
      try {
        await submitScore(quizState.quizId, newState.timeBasedScore);
        setView('results');
      } catch (error) {
        console.error('Failed to submit score:', error);
        alert('Failed to submit score. Please try again.');
      }
    }
  };

  const returnHome = () => {
    setView('home');
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
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#B5E0D6]">
      {view === 'home' && (
        <HomeView 
          onNewQuiz={startNewQuiz}
          onJoinQuiz={() => setView('join')}
        />
      )}
      {view === 'join' && (
        <JoinQuizView
          onJoinQuiz={handleJoinQuiz}
          onBack={() => setView('home')}
        />
      )}
      {view === 'nickname' && (
        <NicknameEntry
          onSubmit={handleNicknameSubmit}
          onBack={() => setView('home')}
        />
      )}
      {view === 'question' && quizState.questions.length > 0 && quizState.currentQuestionIndex < quizState.questions.length && (
        <QuestionView
          question={quizState.questions[quizState.currentQuestionIndex]}
          onAnswer={handleAnswer}
          currentQuestionNumber={quizState.currentQuestionIndex + 1}
          totalQuestions={quizState.questions.length}
          showEmoji={showEmoji}
          timeLimit={quizState.timeLimit}
        />
      )}
      {view === 'results' && (
        <ResultsView
          quizId={quizState.quizId}
          score={quizState.timeBasedScore}
          totalQuestions={quizState.questions.length}
          onReturnHome={returnHome}
          questionScores={quizState.questionScores}
          currentNickname={quizState.currentPlayer.nickname}
        />
      )}
    </div>
  );
}
