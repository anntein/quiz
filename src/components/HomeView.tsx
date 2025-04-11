'use client';

import { FC } from 'react';
import Image from 'next/image';

interface HomeViewProps {
  onNewQuiz: () => void;
  onJoinQuiz: () => void;
}

const HomeView: FC<HomeViewProps> = ({ onNewQuiz, onJoinQuiz }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        <div className="relative w-full h-48 mb-8">
          <Image
            src={process.env.NODE_ENV === 'production' ? '/quiz/quiz-clash.webp' : '/quiz-clash.webp'}
            alt="Quiz Clash"
            fill
            className="object-contain"
            priority
          />
        </div>
        
        <div className="space-y-4">
          <button
            onClick={onNewQuiz}
            className="w-full bg-[#0F3856] hover:bg-[#0a2a3f] text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-[#0F3856]/25"
          >
            New Quiz
          </button>
          
          <button
            onClick={onJoinQuiz}
            className="w-full bg-[#0F3856] hover:bg-[#0a2a3f] text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-[#0F3856]/25"
          >
            Join Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeView; 