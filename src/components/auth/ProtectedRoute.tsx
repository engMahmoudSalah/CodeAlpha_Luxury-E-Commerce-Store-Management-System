import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../ui/Spinner';
import { Button } from '../ui/Button';
import { Lock, ShieldAlert } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { status, isAuthenticated, openAuthModal, authError } = useAuth();

  useEffect(() => {
    if (status === 'unauthenticated') {
      openAuthModal('login');
    }
  }, [status, openAuthModal]);

  if (status === 'initializing') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-slate-400">Verifying your secure session...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Connection Issue</h2>
        <p className="text-sm text-slate-400 mb-6">
          {authError || 'We could not reach the server to verify your session. Please check your connection and try again.'}
        </p>
        <Button onClick={() => window.location.reload()} variant="primary">
          Retry Verification
        </Button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Sign In Required</h2>
        <p className="text-sm text-slate-400 mb-6">
          You must be signed in to view and manage this section of your account.
        </p>
        <Button onClick={() => openAuthModal('login')} variant="primary" size="lg">
          Sign In Now
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};
