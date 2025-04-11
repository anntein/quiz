'use client';

import { FC, useState, useEffect } from 'react';
import { getLastNickname, saveLastNickname } from '@/utils/storage';

interface NicknameEntryProps {
  onSubmit: (nickname: string) => void;
  onBack: () => void;
}

const NicknameEntry: FC<NicknameEntryProps> = ({ onSubmit, onBack }) => {
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
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold mb-8 text-center text-white">Enter Nickname</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="nickname" 
              className="block text-white text-lg font-medium mb-2"
            >
              Your Nickname
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:border-blue-500 focus:outline-none"
              placeholder="Enter your nickname"
            />
            {error && (
              <p className="mt-2 text-red-400 text-sm">{error}</p>
            )}
          </div>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NicknameEntry; 