'use client';

import { FC, useEffect, useState } from 'react';
import Image from 'next/image';
import { RecentQuiz, getRecentQuizzes } from '@/lib/firebase/quizService';
import { signIn, onAuthStateChange } from '@/lib/firebase/authService';
import { formatDistanceToNow } from 'date-fns';

interface HomeViewProps {
  onNewQuiz: () => void;
  onJoinQuiz: (quizId?: string) => void;
}

const HomeView: FC<HomeViewProps> = ({ onNewQuiz, onJoinQuiz }) => {
  const [recentQuizzes, setRecentQuizzes] = useState<RecentQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        try {
          const quizzes = await getRecentQuizzes();
          setRecentQuizzes(quizzes);
          setAuthError(null);
        } catch (error) {
          console.error('Failed to load recent quizzes:', error);
          setAuthError('Failed to load recent quizzes');
        } finally {
          setLoading(false);
        }
      } else {
        try {
          await signIn();
        } catch (error) {
          console.error('Failed to sign in:', error);
          setAuthError('Failed to sign in');
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

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
            onClick={() => onJoinQuiz()}
            className="w-full bg-[#0F3856] hover:bg-[#0a2a3f] text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-[#0F3856]/25"
          >
            Join Quiz
          </button>
        </div>

        {/* Recent Quizzes Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Recent Quizzes</h2>
          {loading ? (
            <div className="text-white/60">Loading recent quizzes...</div>
          ) : authError ? (
            <div className="text-red-500">{authError}</div>
          ) : recentQuizzes.length > 0 ? (
            <div className="space-y-2">
              {recentQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-white/10 rounded-lg p-4 text-left hover:bg-white/15 transition-colors cursor-pointer"
                  onClick={() => onJoinQuiz(quiz.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{quiz.name}</h3>
                      <p className="text-white/60 text-sm">
                        {formatDistanceToNow(quiz.createdAt.toDate(), { addSuffix: true })}
                        {' • '}
                        {quiz.totalParticipants} participant{quiz.totalParticipants !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {quiz.userRank && (
                      <div className="bg-blue-500/20 px-3 py-1 rounded-full">
                        <p className="text-blue-900 text-sm font-medium">
                          #{quiz.userRank.position}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-white/60">No recent quizzes found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeView; 