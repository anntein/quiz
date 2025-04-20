'use client';

import { FC, useEffect, useState } from 'react';
import Image from 'next/image';
import { RecentQuiz, getRecentQuizzes, getLeaderboard, getQuiz } from '@/lib/firebase/quizService';
import { signIn, onAuthStateChange } from '@/lib/firebase/authService';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

interface HomeViewProps {
  onNewQuiz: () => void;
  onJoinQuiz: (quizId: string) => void;
}

interface LeaderboardEntry {
  nickname: string;
  score: number;
}

const HomeView: FC<HomeViewProps> = ({ onNewQuiz, onJoinQuiz }) => {
  const router = useRouter();
  const [recentQuizzes, setRecentQuizzes] = useState<RecentQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [currentUserNickname, setCurrentUserNickname] = useState<string | null>(null);
  const [quizId, setQuizId] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        try {
          const quizzes = await getRecentQuizzes();
          setRecentQuizzes(quizzes);
          // Get the current user's nickname from the first quiz they participated in
          const userQuiz = quizzes.find(quiz => quiz.userRank);
          if (userQuiz) {
            const quizData = await getQuiz(userQuiz.id);
            if (quizData && quizData.participants[user.uid]) {
              setCurrentUserNickname(quizData.participants[user.uid].nickname);
            }
          }
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

  const handleQuizClick = async (quizId: string) => {
    setSelectedQuiz(quizId);
    setLeaderboardLoading(true);
    try {
      const leaderboardData = await getLeaderboard(quizId);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const handleJoinQuiz = async () => {
    setJoinError(null);
    if (!quizId.trim()) {
      setJoinError('Please enter a quiz ID');
      return;
    }

    try {
      const quiz = await getQuiz(quizId);
      if (!quiz) {
        setJoinError('Quiz not found');
        return;
      }

      if (!quiz.isActive) {
        setJoinError('This quiz is no longer active');
        return;
      }

      onJoinQuiz(quizId);
    } catch (error) {
      console.error('Error joining quiz:', error);
      setJoinError('Failed to join quiz. Please try again.');
    }
  };

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
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter quiz ID"
              className="flex-1 bg-white/10 text-[#1E293B] placeholder-[#64748B] border border-[#CBD5E1] rounded-lg px-4 py-3 focus:outline-none focus:border-[#0F3856]"
              onChange={(e) => setQuizId(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleJoinQuiz();
                }
              }}
            />
            <button
              onClick={handleJoinQuiz}
              className="bg-[#0F3856] hover:bg-[#0a2a3f] text-[#F8FAFC] font-bold py-3 px-6 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-[#0F3856]/25"
            >
              Start
            </button>
          </div>
          {joinError && (
            <p className="text-red-500 text-sm">{joinError}</p>
          )}

          <div className="text-center my-4">
            <span className="text-[#64748B]">or</span>
          </div>

          <button
            onClick={onNewQuiz}
            className="w-full bg-[#0F3856] hover:bg-[#0a2a3f] text-[#F8FAFC] font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200 shadow-lg hover:shadow-[#0F3856]/25"
          >
            Start new quiz battle ⚔️
          </button>
        </div>

        {/* Recent Quizzes Section */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-[#1E293B] mb-2 text-left">Recent Quizzes</h2>
          {loading ? (
            <div className="text-[#64748B]">Loading recent quizzes...</div>
          ) : authError ? (
            <div className="text-red-500">{authError}</div>
          ) : recentQuizzes.filter(quiz => quiz.totalParticipants >= 2).length > 0 ? (
            <div className="space-y-2">
              {recentQuizzes.filter(quiz => quiz.totalParticipants >= 2).map((quiz) => {
                const participants = quiz.participants || [];
                const visibleParticipants = participants.slice(0, 3);
                const remainingCount = Math.max(0, participants.length - 3);
                
                let title = "Quiz";
                if (participants.length === 1) {
                  title = "Solo quiz 🎻";
                } else if (participants.length === 2) {
                  title = `You vs. "${participants[0]}"`;
                } else if (participants.length === 3) {
                  title = `You vs. "${participants[0]}" and "${participants[1]}"`;
                } else if (participants.length === 4) {
                  title = `You vs. "${participants[0]}", "${participants[1]}" and "${participants[2]}"`;
                } else if (participants.length > 4) {
                  title = `You vs. "${participants[0]}", "${participants[1]}" and ${remainingCount} more`;
                }

                return (
                  <div
                    key={quiz.id}
                    className={`bg-white/10 rounded-lg p-4 text-left cursor-pointer transition-colors ${
                      selectedQuiz === quiz.id ? 'bg-white/20' : 'hover:bg-white/15'
                    }`}
                    onClick={() => handleQuizClick(quiz.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-[#1E293B]">{title}</h3>
                        <p className="text-[#475569] text-sm">
                          {formatDistanceToNow(quiz.createdAt.toDate(), { addSuffix: true })}
                          {' • '}
                          {quiz.totalParticipants} participant{quiz.totalParticipants !== 1 ? 's' : ''}
                        </p>
                      </div>
                      {quiz.userRank && quiz.totalParticipants >= 2 && (
                        <div className="bg-blue-500/20 px-3 py-1 rounded-full">
                          <p className="text-[#1E293B] text-sm font-medium">
                            {quiz.userRank.position === 1 ? '👑' : `#${quiz.userRank.position}`}
                          </p>
                        </div>
                      )}
                    </div>
                    {selectedQuiz === quiz.id && (
                      <div className="mt-4">
                        <h4 className="text-lg font-semibold text-[#1E293B] mb-2">Leaderboard</h4>
                        {leaderboardLoading ? (
                          <div className="text-[#64748B]">Loading leaderboard...</div>
                        ) : leaderboard.length > 0 ? (
                          <div className="space-y-2">
                            {leaderboard.map((player, index) => (
                              <div
                                key={player.nickname}
                                className={`flex justify-between items-center p-2 rounded ${
                                  player.nickname === currentUserNickname
                                    ? 'bg-blue-500/30 border-2 border-blue-400'
                                    : 'bg-white/5'
                                }`}
                              >
                                <span className="text-[#1E293B]">
                                  {index + 1}. {player.nickname}
                                  {player.nickname === currentUserNickname && ' (You)'}
                                </span>
                                <span className="text-[#1E293B] font-medium">
                                  {player.score} points
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[#64748B]">No scores yet</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-[#64748B]">No recent quizzes found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeView; 