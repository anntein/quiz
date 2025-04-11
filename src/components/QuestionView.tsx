'use client';

import { FC, useState, useEffect } from 'react';
import Timer from './Timer';
import { Question } from '@/lib/types';

interface QuestionViewProps {
  question: Question;
  onAnswer: (answerId: string, timeSpent: number) => void;
  currentQuestionNumber: number;
  totalQuestions: number;
  showEmoji: boolean;
  timeLimit: number;
}

const QuestionView: FC<QuestionViewProps> = ({
  question,
  onAnswer,
  currentQuestionNumber,
  totalQuestions,
  showEmoji,
  timeLimit
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isTimeout, setIsTimeout] = useState(false);

  // Reset timer state when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setIsTimeout(false);
    setQuestionStartTime(Date.now());
  }, [currentQuestionNumber]);

  const handleAnswer = (answerId: string) => {
    if (selectedAnswer) return;
    
    const timeSpent = (Date.now() - questionStartTime) / 1000;
    setSelectedAnswer(answerId);
    onAnswer(answerId, timeSpent);
  };

  const handleTimeout = () => {
    if (!selectedAnswer && !isTimeout) {
      setIsTimeout(true);
      const timeSpent = timeLimit;
      onAnswer('', timeSpent);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        {!selectedAnswer && !isTimeout && (
          <Timer 
            key={currentQuestionNumber}
            timeLimit={timeLimit} 
            onTimeout={handleTimeout}
          />
        )}
        <h2 className="text-2xl font-bold mb-4 text-white">
          Question {currentQuestionNumber} of {totalQuestions}
        </h2>
        <p className="text-xl mb-8 text-white">{question.text}</p>
        <div className="grid grid-cols-1 gap-4">
          {question.alternatives.map((alternative) => (
            <button
              key={alternative.id}
              onClick={() => handleAnswer(alternative.id)}
              disabled={selectedAnswer !== null || isTimeout}
              className={`p-4 rounded-lg text-white text-lg font-semibold transition-all
                ${selectedAnswer === null && !isTimeout
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : alternative.id === question.correctAnswerId
                    ? 'bg-green-600'
                    : selectedAnswer === alternative.id
                      ? 'bg-red-600'
                      : 'bg-blue-600 opacity-50'
                }`}
            >
              {alternative.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionView; 