import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authApi, LoginPayload, RegisterPayload } from '../api/authApi';
import { useToast } from './ToastContext';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export type AuthStatus = 'initializing' | 'authenticated' | 'unauthenticated' | 'error';

interface AuthContextType {
  user: User | null;
  status: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  authError: string | null;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (payload: LoginPayload) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('initializing');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const { showToast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
          setStatus('authenticated');
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser(null);
          setStatus('error');
          setAuthError('Failed to load user profile.');
        }
      } else {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
          setStatus('authenticated');
        } catch {
          setUser(null);
          setStatus('unauthenticated');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = useCallback((tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const login = useCallback(async (payload: LoginPayload): Promise<User> => {
    const loggedInUser = await authApi.login(payload);
    // onAuthStateChanged will handle setting the user state, but we can optimistically set it here too
    setUser(loggedInUser);
    setStatus('authenticated');
    setAuthError(null);
    closeAuthModal();
    showToast(`مرحباً بعودتك، ${loggedInUser.name}!`, 'success');
    return loggedInUser;
  }, [closeAuthModal, showToast]);

  const loginWithGoogle = useCallback(async (): Promise<User> => {
    const loggedInUser = await authApi.loginWithGoogle();
    setUser(loggedInUser);
    setStatus('authenticated');
    setAuthError(null);
    closeAuthModal();
    showToast(`أهلاً بك في فخامة، ${loggedInUser.name}! تم تسجيل الدخول بنجاح عبر Google.`, 'success');
    return loggedInUser;
  }, [closeAuthModal, showToast]);

  const register = useCallback(async (payload: RegisterPayload): Promise<User> => {
    const registeredUser = await authApi.register(payload);
    setUser(registeredUser);
    setStatus('authenticated');
    setAuthError(null);
    closeAuthModal();
    showToast(`أهلاً بك في فخامة، ${registeredUser.name}!`, 'success');
    return registeredUser;
  }, [closeAuthModal, showToast]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authApi.logout();
      setUser(null);
      setStatus('unauthenticated');
      showToast('تم تسجيل الخروج بنجاح.', 'info');
    } catch (err) {
      console.warn('Logout warning:', err);
    }
  }, [showToast]);

  const refreshUser = useCallback(async () => {
    try {
      if (auth.currentUser) {
        const userData = await authApi.getMe();
        setUser(userData);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        isLoading: status === 'initializing',
        isAuthenticated: status === 'authenticated' && user !== null,
        authError,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshUser,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
