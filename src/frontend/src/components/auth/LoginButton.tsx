import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import { LogIn, LogOut, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { logLoginAttempt, logLoginSuccess, logLoginFailure } from '../../utils/authDiagnostics';
import InternetIdentityErrorNotice from './InternetIdentityErrorNotice';

export default function LoginButton() {
  const { login, clear, loginStatus, identity, loginError } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [retryAttempt, setRetryAttempt] = useState(0);

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';
  const showError = loginStatus === 'loginError' && !isAuthenticated && loginError;

  // Log login status changes
  useEffect(() => {
    if (loginStatus === 'success' && identity) {
      logLoginSuccess();
    }
  }, [loginStatus, identity]);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      const hadIdentityBefore = !!identity;
      logLoginAttempt(hadIdentityBefore);
      
      try {
        await login();
      } catch (error: any) {
        logLoginFailure(error, hadIdentityBefore);
        
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const handleRetry = () => {
    setRetryAttempt((prev) => prev + 1);
    handleAuth();
  };

  if (showError) {
    return <InternetIdentityErrorNotice error={loginError} onRetry={handleRetry} />;
  }

  return (
    <Button onClick={handleAuth} disabled={disabled} variant={isAuthenticated ? 'outline' : 'default'} size="sm">
      {loginStatus === 'logging-in' ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Logging in...
        </>
      ) : isAuthenticated ? (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </>
      ) : (
        <>
          <LogIn className="mr-2 h-4 w-4" />
          Login
        </>
      )}
    </Button>
  );
}
