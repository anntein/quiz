'use client';

import { FC, useState, useEffect, useCallback } from 'react';
import { Question } from '@/lib/types';

interface QuestionViewProps {
  question: Question;
  onAnswer: (answerId: string) => void;
  currentQuestionNumber: number;
  totalQuestions: number;
  showEmoji: boolean;
}

const QUESTION_TIME_LIMIT = 5; // Time limit in seconds

const QuestionView: FC<QuestionViewProps> = ({
  question,
  onAnswer,
  currentQuestionNumber,
  totalQuestions,
  showEmoji,
}) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_LIMIT);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  const handleAnswer = useCallback(async (answerId: string) => {
    if (isAnswered) return; // Prevent multiple submissions
    setIsAnswered(true);
    setSelectedId(answerId);
    
    // Clear the timer interval
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
    
    onAnswer(answerId);
  }, [isAnswered, onAnswer, timerInterval]);

  // Timer effect
  useEffect(() => {
    setTimeLeft(QUESTION_TIME_LIMIT);
    setIsAnswered(false);
    setSelectedId(null);
    
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1 && !isAnswered) {
          clearInterval(timer);
          setTimerInterval(null);
          // Use a small timeout to avoid state updates during render
          setTimeout(() => {
            onAnswer('time_out');
          }, 0);
          return 0;
        }
        return prevTime > 0 ? prevTime - 1 : 0;
      });
    }, 1000);

    setTimerInterval(timer);

    return () => {
      clearInterval(timer);
    };
  }, [question.id, isAnswered, onAnswer]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Timer display */}
        <div className="mb-4 text-center">
          <div className="font-bold text-[#1e293b]">
            {timeLeft} seconds left
          </div>
        </div>

        <div className="mb-8 text-center">
          <p className="text-sm text-[#1e293b] mb-2">
            Question {currentQuestionNumber} of {totalQuestions}
          </p>
          <h2 className="text-xl font-bold text-[#1e293b]">{question.text}</h2>
        </div>

        <div className="space-y-4">
          {question.alternatives.map((alternative) => (
            <button
              key={alternative.id}
              onClick={() => handleAnswer(alternative.id)}
              disabled={isAnswered}
              className={`w-full p-4 rounded-lg text-left transition-all duration-200 ${
                isAnswered
                  ? alternative.id === selectedId
                    ? alternative.id === question.correctAnswerId
                      ? 'bg-[#22c55e] text-white'
                      : 'bg-[#ef4444] text-white'
                    : alternative.id === question.correctAnswerId
                    ? 'bg-[#22c55e] text-white'
                    : 'bg-white/50 text-[#1e293b]'
                  : 'bg-white/50 hover:bg-white text-[#1e293b]'
              }`}
            >
              {alternative.text} {showEmoji && alternative.id === question.correctAnswerId && " 🤩"}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionView; 