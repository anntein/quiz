export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-800 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-white mb-4">404</h1>
        <p className="text-white/90 text-lg mb-8">Page not found</p>
        <a
          href="/quiz-test"
          className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
} 