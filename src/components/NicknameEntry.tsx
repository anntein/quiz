'use client';

import { FC, useState, useEffect } from 'react';
import { getLastNickname, saveLastNickname } from '@/utils/storage';

interface NicknameEntryProps {
  onSubmit: (nickname: string) => void;
}

const NicknameEntry: FC<NicknameEntryProps> = ({ onSubmit }) => {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Load last used nickname when component mounts
    const savedNickname = getLastNickname();
    if (savedNickname) {
      setNickname(savedNickname);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname.trim()) {
      setError('Please enter a nickname');
      return;
    }

    // Save nickname for future use
    saveLastNickname(nickname);
    onSubmit(nickname);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6 text-[#1E293B]">Enter Your Nickname</h2>
        
        <div className="space-y-4">
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Choose a cool nickname"
            className="w-full bg-white/10 text-[#1E293B] placeholder-[#64748B] border border-[#CBD5E1] rounded-lg px-4 py-3 focus:outline-none focus:border-[#0F3856]"
            maxLength={20}
          />
          
          <button
            onClick={handleSubmit}
            disabled={!nickname.trim()}
            className={`w-full py-3 px-8 rounded-lg text-lg font-bold transition-colors duration-200 ${
              nickname.trim()
                ? 'bg-[#0F3856] hover:bg-[#0a2a3f] text-[#F8FAFC] shadow-lg hover:shadow-[#0F3856]/25'
                : 'bg-[#0F3856]/50 text-[#F8FAFC]/50 cursor-not-allowed'
            }`}
          >
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default NicknameEntry; 