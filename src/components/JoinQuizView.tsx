import { FC, useState } from 'react';
import { getQuiz } from '@/lib/firebase/quizService';

interface JoinQuizViewProps {
  onJoinQuiz: (quizId: string) => void;
  onBack: () => void;
}

const JoinQuizView: FC<JoinQuizViewProps> = ({ onJoinQuiz, onBack }) => {
  const [quizId, setQuizId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!quizId.trim()) {
      setError('Please enter a quiz ID');
      return;
    }

    try {
      const quiz = await getQuiz(quizId);
      if (!quiz) {
        setError('Quiz not found');
        return;
      }

      if (!quiz.isActive) {
        setError('This quiz is no longer active');
        return;
      }

      onJoinQuiz(quizId);
    } catch (error) {
      setError('Failed to join quiz. Please try again.');
      console.error('Error joining quiz:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h2 className="text-3xl font-bold mb-8 text-center text-white">Join Quiz</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="quizId" 
              className="block text-white text-lg font-medium mb-2"
            >
              Enter Quiz ID
            </label>
            <input
              id="quizId"
              type="text"
              value={quizId}
              onChange={(e) => setQuizId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/10 text-white border border-white/20 focus:border-blue-500 focus:outline-none"
              placeholder="Quiz ID"
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
              Join
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinQuizView; 