import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-50">
      <div className="text-center">
        <p className="text-9xl font-bold text-primary-200">404</p>
        <h1 className="text-2xl font-bold text-gray-700 mt-4">Page Not Found</h1>
        <p className="text-gray-400 mt-2">The page you're looking for doesn't exist.</p>
        <button onClick={() => navigate('/')}
          className="mt-6 flex items-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-600 transition mx-auto">
          <Home size={18} /> Back to Home
        </button>
      </div>
    </div>
  );
}
