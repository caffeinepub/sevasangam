import { ReactNode, useState, useEffect } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '../ui/button';
import { LogIn, Loader2 } from 'lucide-react';
import { logLoginAttempt, logLoginSuccess, logLoginFailure } from '../../utils/authDiagnostics';
import InternetIdentityErrorNotice from '../auth/InternetIdentityErrorNotice';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { identity, login, loginStatus, loginError } = useInternetIdentity();
  const [retryAttempt, setRetryAttempt] = useState(0);

  const showError = loginStatus === 'loginError' && !identity && loginError;

  // Log login status changes
  useEffect(() => {
    if (loginStatus === 'success' && identity) {
      logLoginSuccess();
    }
  }, [loginStatus, identity]);

  const handleLogin = async () => {
    const hadIdentityBefore = !!identity;
    logLoginAttempt(hadIdentityBefore);
    
    try {
      await login();
    } catch (error: any) {
      logLoginFailure(error, hadIdentityBefore);
    }
  };

  const handleRetry = () => {
    setRetryAttempt((prev) => prev + 1);
    handleLogin();
  };

  if (!identity) {
    return (
      <div className="container max-w-md mx-auto py-16 px-4">
        <div className="space-y-6">
          {showError ? (
            <InternetIdentityErrorNotice error={loginError} onRetry={handleRetry} />
          ) : (
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Authentication Required</h2>
                <p className="text-muted-foreground">Please log in to access this page.</p>
              </div>
              <Button onClick={handleLogin} disabled={loginStatus === 'logging-in'} size="lg">
                {loginStatus === 'logging-in' ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Login with Internet Identity
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
