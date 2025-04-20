'use client';

import { FC, useState, useEffect } from 'react';
import Timer from './Timer';
import { Question } from '@/types/quiz';
import { getQuestionStats } from '@/lib/firebase/questionService';

interface QuestionViewProps {
  question: Question;
  onAnswerSubmit: (answerId: string) => void;
  currentQuestionNumber: number;
  totalQuestions: number;
}

const QuestionView: FC<QuestionViewProps> = ({
  question,
  onAnswerSubmit,
  currentQuestionNumber,
  totalQuestions
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isTimeout, setIsTimeout] = useState(false);
  const [stats, setStats] = useState<{ totalAttempts: number; correctAttempts: number } | null>(null);

  // Reset timer state when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setIsTimeout(false);
    setQuestionStartTime(Date.now());
    
    // Fetch question statistics
    const fetchStats = async () => {
      const questionStats = await getQuestionStats(question.id);
      if (questionStats) {
        setStats({
          totalAttempts: questionStats.totalAttempts,
          correctAttempts: questionStats.correctAttempts
        });
      }
    };
    
    fetchStats();
  }, [currentQuestionNumber, question.id]);

  const handleAnswer = (answerId: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answerId);
    onAnswerSubmit(answerId);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        <h2 className="text-2xl font-bold mb-4 text-[#1E293B]">
          Question {currentQuestionNumber} of {totalQuestions}
        </h2>
        <p className="text-xl mb-8 text-[#1E293B]">{question.text}</p>
        <div className="grid grid-cols-1 gap-4">
          {question.alternatives.map((alternative) => (
            <button
              key={alternative.id}
              onClick={() => handleAnswer(alternative.id)}
              disabled={selectedAnswer !== null || isTimeout}
              className={`p-4 rounded-lg text-lg font-semibold transition-all
                ${selectedAnswer === null && !isTimeout
                  ? 'bg-[#0F3856] hover:bg-[#0a2a3f] text-[#F8FAFC]' 
                  : 'bg-[#0F3856] opacity-50 text-[#F8FAFC]'
                }`}
            >
              {selectedAnswer && alternative.id === question.correctAnswerId ? '🤩' : alternative.text}
            </button>
          ))}
        </div>
        {stats && (
          <div className="mt-4 text-[#64748B] text-sm">
            Stats: {stats.correctAttempts}/{stats.totalAttempts} correct ({((stats.correctAttempts / stats.totalAttempts) * 100).toFixed(1)}% win rate)
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionView; 