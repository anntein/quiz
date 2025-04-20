'use client';

import { useState, useEffect } from 'react';
import HomeView from '@/components/HomeView';
import NicknameEntry from '@/components/NicknameEntry';
import QuestionView from '@/components/QuestionView';
import ResultsView from '@/components/ResultsView';
import { Question, QuizState, QuizView } from '@/lib/types';
import { getQuestions } from '@/lib/questions';
import { calculateScore } from '@/utils/scores';
import { createQuiz, submitScore } from '@/lib/firebase/quizService';
import { onAuthStateChange } from '@/lib/firebase/authService';
import { saveLastNickname, getLastNickname } from '@/utils/storage';
import { TIME_LIMIT } from '@/lib/constants';
import { TIME_BONUS_RATE } from '@/lib/constants';
import { getQuiz } from '@/lib/firebase/quizService';

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

const Page = () => {
  const [quizState, setQuizState] = useState<QuizState>({
    view: QuizView.HOME,
    quizId: null,
    questions: [],
    currentQuestionIndex: 0,
    score: 0,
    timeBasedScore: 0,
    currentPlayer: null,
    participants: {},
    isActive: true,
    createdAt: new Date(),
    totalParticipants: 0,
    userRank: null
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      if (!user) {
        setQuizState(prev => ({ ...prev, view: QuizView.HOME }));
      }
    });

    const lastNickname = getLastNickname();
    if (lastNickname && quizState.currentPlayer) {
      setQuizState(prev => ({
        ...prev,
        currentPlayer: {
          ...prev.currentPlayer!,
          nickname: lastNickname
        }
      }));
    }

    return () => unsubscribe();
  }, []);

  const handleNewQuiz = async () => {
    try {
      const questions = await getQuestions();
      const quizId = await createQuiz(questions);
      
      setQuizState(prev => ({
        ...prev,
        view: QuizView.NICKNAME_ENTRY,
        quizId,
        questions,
        currentQuestionIndex: 0,
        score: 0,
        timeBasedScore: 0,
        currentPlayer: null,
        participants: {},
        isActive: true,
        createdAt: new Date(),
        totalParticipants: 0,
        userRank: null
      }));
    } catch (error) {
      console.error('Failed to create new quiz:', error);
    }
  };

  const handleJoinQuiz = async (quizId: string) => {
    try {
      const quiz = await getQuiz(quizId);
      if (!quiz) {
        console.error('Quiz not found');
        return;
      }

      setQuizState(prev => ({
        ...prev,
        view: QuizView.NICKNAME_ENTRY,
        quizId,
        questions: quiz.questions,
        currentQuestionIndex: 0,
        score: 0,
        timeBasedScore: 0,
        currentPlayer: null,
        participants: {},
        isActive: true,
        createdAt: new Date(),
        totalParticipants: 0,
        userRank: null
      }));
    } catch (error) {
      console.error('Failed to join quiz:', error);
    }
  };

  const handleNicknameSubmit = (nickname: string) => {
    saveLastNickname(nickname);
    setQuizState(prev => ({
      ...prev,
      view: QuizView.QUESTION,
      currentPlayer: { 
        nickname, 
        score: 0,
        timeBasedScore: 0
      }
    }));
  };

  const handleAnswerSubmit = async (selectedAnswerId: string) => {
    const currentQuestion = quizState.questions[quizState.currentQuestionIndex];
    const isCorrect = selectedAnswerId === currentQuestion.correctAnswerId;
    const timeRemaining = 30; // This should come from your timer component
    const questionScore = calculateScore(isCorrect, timeRemaining);

    const newState = {
      ...quizState,
      score: quizState.score + (isCorrect ? 1 : 0),
      timeBasedScore: quizState.timeBasedScore + questionScore,
      currentQuestionIndex: quizState.currentQuestionIndex + 1,
      currentPlayer: {
        ...quizState.currentPlayer!,
        score: (quizState.currentPlayer?.score || 0) + (isCorrect ? 1 : 0),
        timeBasedScore: (quizState.currentPlayer?.timeBasedScore || 0) + questionScore
      }
    };

    if (newState.currentQuestionIndex >= newState.questions.length) {
      try {
        await submitScore(
          newState.quizId!,
          newState.timeBasedScore,
          newState.currentPlayer!.nickname,
          newState.questions.map((q, i) => ({
            questionId: q.id,
            isCorrect: i < newState.currentQuestionIndex ? 
              newState.questions[i].correctAnswerId === selectedAnswerId : false
          }))
        );
        setQuizState(prev => ({ ...prev, view: QuizView.RESULTS }));
      } catch (error) {
        console.error('Failed to submit score:', error);
      }
    } else {
      setQuizState(newState);
    }
  };

  const handleRestart = () => {
    setQuizState(prev => ({
      ...prev,
      view: QuizView.HOME,
      quizId: null,
      questions: [],
      currentQuestionIndex: 0,
      score: 0,
      timeBasedScore: 0,
      currentPlayer: null,
      participants: {},
      isActive: true,
      createdAt: new Date(),
      totalParticipants: 0,
      userRank: null
    }));
  };

  return (
    <div className="min-h-screen bg-[#B5E0D6]">
      {quizState.view === QuizView.HOME && (
        <HomeView onNewQuiz={handleNewQuiz} onJoinQuiz={handleJoinQuiz} />
      )}
      {quizState.view === QuizView.NICKNAME_ENTRY && (
        <NicknameEntry onSubmit={handleNicknameSubmit} />
      )}
      {quizState.view === QuizView.QUESTION && (
        <QuestionView
          question={quizState.questions[quizState.currentQuestionIndex]}
          onAnswerSubmit={handleAnswerSubmit}
          currentQuestionNumber={quizState.currentQuestionIndex + 1}
          totalQuestions={quizState.questions.length}
        />
      )}
      {quizState.view === QuizView.RESULTS && (
        <ResultsView
          quizId={quizState.quizId!}
          score={quizState.score}
          totalQuestions={quizState.questions.length}
          onReturnHome={handleRestart}
          questionScores={quizState.questions.map((q, i) => ({
            accuracy: q.correctAnswerId === quizState.questions[i].correctAnswerId ? 1 : 0,
            timeBonus: 0 // You can calculate this based on your time tracking
          }))}
          currentNickname={quizState.currentPlayer?.nickname || ''}
          questions={quizState.questions}
        />
      )}
    </div>
  );
};

export default Page;
