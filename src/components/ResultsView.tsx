'use client';

import { FC, useState, useEffect } from 'react';
import { getLeaderboard } from '@/lib/firebase/quizService';

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
}

const ResultsView: FC<ResultsViewProps> = ({
  quizId,
  score,
  totalQuestions,
  onReturnHome,
  questionScores,
  currentNickname
}) => {
  const [leaderboard, setLeaderboard] = useState<Array<{
    nickname: string;
    score: number;
  }>>([]);

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const scores = await getLeaderboard(quizId);
        setLeaderboard(scores);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      }
    };

    loadLeaderboard();
  }, [quizId]);

  const correctAnswers = questionScores.filter(q => q.accuracy > 0).length;
  const totalTimeBonus = questionScores.reduce((sum, q) => sum + q.timeBonus, 0);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl text-center">
        <h2 className="text-3xl font-bold mb-8 text-white">Quiz Complete!</h2>
        
        <div className="bg-white/10 rounded-lg p-6 mb-8">
          <div className="text-4xl font-bold mb-4 text-white">{score} points</div>
          <div className="text-xl text-white mb-2">
            {correctAnswers} out of {totalQuestions} correct
          </div>
          <div className="text-xl text-white mb-6">
            {totalTimeBonus} points in time bonus
          </div>

          <div className="mt-8">
            <h3 className="text-2xl font-bold mb-4 text-white">Leaderboard</h3>
            <div className="space-y-2">
              {leaderboard.map((player, index) => (
                <div 
                  key={player.nickname}
                  className={`flex justify-between items-center p-3 rounded-lg ${
                    player.nickname === currentNickname
                      ? 'bg-blue-500/30 border-2 border-blue-400'
                      : 'bg-white/5'
                  }`}
                >
                  <span className="text-white">
                    {index + 1}. {player.nickname}
                  </span>
                  <span className="text-white font-bold">
                    {player.score} points
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={onReturnHome}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition-colors"
        >
          Play Again
        </button>

        <div className="mt-8 p-4 bg-white/10 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">Share this quiz with friends:</h3>
          <div className="space-y-4">
            <div>
              <p className="text-white/60 text-sm mb-1">Quiz ID:</p>
              <div className="text-2xl font-bold text-white bg-white/20 p-3 rounded-lg text-center">
                {quizId}
              </div>
            </div>
            <div>
              <p className="text-white/60 text-sm mb-1">Or share this link:</p>
              <div 
                className="text-lg text-blue-400 bg-white/20 p-3 rounded-lg text-center cursor-pointer hover:bg-white/30 transition-colors"
                onClick={() => {
                  const url = `${window.location.origin}/?join=${quizId}`;
                  navigator.clipboard.writeText(url);
                }}
              >
                {window.location.origin}/?join={quizId}
              </div>
              <p className="text-white/60 text-xs mt-1 text-center">
                Click to copy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsView; 