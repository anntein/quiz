'use client';

import { FC } from 'react';
import Image from 'next/image';

interface HomeViewProps {
  onStartQuiz: () => void;
}

const HomeView: FC<HomeViewProps> = ({ onStartQuiz }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        <div className="relative w-full h-48 mb-8">
          <Image
            src={process.env.NODE_ENV === 'production' ? '/quiz-test/quiz-clash.webp' : '/quiz-clash.webp'}
            alt="Quiz Clash"
            fill
            className="object-contain"
            priority
          />
        </div>
        <button
          onClick={onStartQuiz}
          className="bg-[#0F3856] hover:bg-[#0a2a3f] text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-[#0F3856]/25"
        >
          New Quiz
        </button>
      </div>
    </div>
  );
};

export default HomeView; 