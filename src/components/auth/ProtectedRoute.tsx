import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoginModal from './LoginModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  redirectTo = '/' 
}) => {
  const { user, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Instead of redirecting, show login modal
    return (
      <>
        <div className="pt-20 min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
              <p className="text-gray-600 mb-6">
                Please sign in to access your personalized workout dashboard and track your fitness progress.
              </p>
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
              >
                Sign In to Continue
              </button>
            </div>
          </div>
        </div>

        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
        />
      </>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
