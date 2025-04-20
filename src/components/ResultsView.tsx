'use client';

import { FC, useEffect } from 'react';
import { Question } from '@/lib/types';
import { submitScore } from '@/lib/firebase/quizService';

interface ResultsViewProps {
  quizId: string;
  score: number;
  totalQuestions: number;
  onReturnHome: () => void;
  questionScores: {
    accuracy: number;
    timeBonus: number;
  }[];
  currentNickname: string;
  questions: { id: string }[];
}

const ResultsView: FC<ResultsViewProps> = ({
  quizId,
  score,
  totalQuestions,
  onReturnHome,
  questionScores = [],
  currentNickname,
  questions = [],
}) => {
  // Submit score and update question statistics
  useEffect(() => {
    const submitResults = async () => {
      if (!quizId || !currentNickname || !questionScores.length || !questions.length) {
        console.error('Missing required data for score submission');
        return;
      }

      try {
        await submitScore(
          quizId,
          score,
          currentNickname,
          questionScores.map((q, index) => ({
            questionId: questions[index].id,
            isCorrect: q.accuracy > 0
          }))
        );
      } catch (error) {
        console.error('Failed to submit score:', error);
      }
    };

    submitResults();
  }, [quizId, score, currentNickname, questionScores, questions]);

  const handleShare = async () => {
    if (!quizId) {
      console.error('No quiz ID available for sharing');
      return;
    }

    try {
      const quizUrl = `${window.location.origin}/quiz/${quizId}`;
      if (navigator.share) {
        await navigator.share({
          title: 'Quiz Results',
          text: `I scored ${score} points in this quiz! Can you beat my score?`,
          url: quizUrl,
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(quizUrl);
        alert('Quiz URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback for browsers that don't support Web Share API
      const quizUrl = `${window.location.origin}/quiz/${quizId}`;
      await navigator.clipboard.writeText(quizUrl);
      alert('Quiz URL copied to clipboard!');
    }
  };

  const correctAnswers = questionScores?.filter(q => q.accuracy > 0).length || 0;
  const totalTimeBonus = questionScores?.reduce((sum, q) => sum + q.timeBonus, 0) || 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        <h2 className="text-3xl font-bold mb-6 text-[#1E293B]">Quiz Results</h2>
        
        <div className="bg-white/10 rounded-lg p-6 mb-8">
          <p className="text-2xl font-semibold text-[#1E293B] mb-2">
            Your Score: {score} / {totalQuestions * 100}
          </p>
          <p className="text-[#475569]">
            {score >= totalQuestions * 80
              ? "🎉 Amazing job! You're a quiz master!"
              : score >= totalQuestions * 60
              ? "👍 Good effort! Keep practicing!"
              : "💪 Don't worry, you'll do better next time!"}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleShare}
            className="w-full bg-[#0F3856] hover:bg-[#0a2a3f] text-[#F8FAFC] font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-[#0F3856]/25"
          >
            Add people to this quiz 🤺
          </button>
          
          <div className="text-center">
            <p className="text-[#64748B]">
              Or give them this code: <span className="font-medium text-[#1E293B]">{quizId}</span>
            </p>
          </div>
          
          <div className="text-center">
            <button
              onClick={onReturnHome}
              className="text-[#64748B] hover:text-[#475569] transition-colors"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsView; 