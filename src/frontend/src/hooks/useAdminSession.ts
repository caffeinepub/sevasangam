import { useState, useEffect } from 'react';
import { useActor } from './useActor';
import { saveAdminSession, getAdminSession, clearAdminSession, isAdminSessionActive } from '../utils/adminSessionStorage';

export function useAdminSession() {
  const { actor } = useActor();
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
      throw new Error('Actor not available');
    }

    try {
      // Test the credentials by calling an admin-only method
      // The backend will validate the credentials
      await actor.getAllInquiries(username, password);
      
      // If successful, save the session
      saveAdminSession(username);
      setIsAdminAuthenticated(true);
      return true;
    } catch (error: any) {
      // Login failed
      clearAdminSession();
      setIsAdminAuthenticated(false);
      throw new Error('Invalid username or password');
    }
  };

  const logout = () => {
    clearAdminSession();
    setIsAdminAuthenticated(false);
  };

  return {
    isAdminAuthenticated,
    isLoading,
    login,
    logout,
    getCredentials: getAdminSession,
  };
}
