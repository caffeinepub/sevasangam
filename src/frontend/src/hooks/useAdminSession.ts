import { useState, useEffect } from 'react';
import { useActor } from './useActor';
import { saveAdminSession, getAdminSession, clearAdminSession } from '../utils/adminSessionStorage';

export function useAdminSession() {
  const { actor, isFetching: actorLoading } = useActor();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if there's an existing admin session
    const session = getAdminSession();
    setIsAdminAuthenticated(!!session);
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    if (!actor) {
      throw new Error('Connection not ready. Please wait a moment and try again.');
    }

    try {
      // Test the credentials by calling an admin-only method
      // The backend will validate the credentials
      await actor.getAllInquiries(username, password);
      
      // If successful, save the session with both username and password
      saveAdminSession(username, password);
      setIsAdminAuthenticated(true);
      return true;
    } catch (error: any) {
      // Clear any stale session
      clearAdminSession();
      setIsAdminAuthenticated(false);
      
      // Classify the error
      const errorMessage = error?.message || String(error);
      
      // Network/connectivity errors
      if (
        errorMessage.includes('fetch') ||
        errorMessage.includes('network') ||
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('NetworkError') ||
        errorMessage.includes('timeout')
      ) {
        throw new Error('Connection problem. Please check your internet and try again.');
      }
      
      // Unauthorized/invalid credentials
      if (
        errorMessage.includes('Unauthorized') ||
        errorMessage.includes('trap')
      ) {
        throw new Error('Invalid username or password. Please check your credentials.');
      }
      
      // Generic error
      throw new Error('Login failed. Please try again.');
    }
  };

  const logout = () => {
    clearAdminSession();
    setIsAdminAuthenticated(false);
  };

  return {
    isAdminAuthenticated,
    isLoading,
    actorReady: !!actor && !actorLoading,
    login,
    logout,
    getCredentials: getAdminSession,
  };
}
