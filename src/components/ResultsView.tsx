'use client';

import { FC } from 'react';

interface ResultsViewProps {
  score: number;
  totalQuestions: number;
  onReturnHome: () => void;
}

const ResultsView: FC<ResultsViewProps> = ({
  score,
  totalQuestions,
  onReturnHome,
}) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-8 text-[#1e293b]">Quiz Complete! 🎉</h1>
        <div className="bg-white/50 rounded-lg p-8 mb-8">
          <p className="text-2xl font-bold text-[#1e293b] mb-2">Your Score</p>
          <p className="text-4xl font-bold text-[#1e293b] mb-4">{percentage}%</p>
          <p className="text-[#1e293b]">
            You got {score} out of {totalQuestions} questions correct
          </p>
        </div>
        <button
          onClick={onReturnHome}
          className="bg-[#0F3856] hover:bg-[#0a2a3f] text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-[#0F3856]/25"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

export default ResultsView; 