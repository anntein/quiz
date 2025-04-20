'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getQuiz } from '@/lib/firebase/quizService';

interface QuizPageProps {
  params: {
    quizId: string;
  };
}

export default function QuizPage({ params }: QuizPageProps) {
  const router = useRouter();
  const { quizId } = params;

  useEffect(() => {
    const checkQuiz = async () => {
      try {
        const quiz = await getQuiz(quizId);
        if (quiz) {
          // Redirect to the home page with the join parameter
          router.push(`/?join=${quizId}`);
        } else {
          // Quiz not found, redirect to home page
          router.push('/');
        }
      } catch (error) {
        console.error('Error checking quiz:', error);
        router.push('/');
      }
    };

    checkQuiz();
  }, [quizId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Loading quiz...</h1>
        <p className="text-gray-600">Please wait while we prepare your quiz.</p>
      </div>
    </div>
  );
} 