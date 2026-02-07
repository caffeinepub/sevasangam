import { ReactNode } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '../ui/button';
import { LogIn } from 'lucide-react';

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { identity, login, loginStatus } = useInternetIdentity();

  if (!identity) {
    return (
      <div className="container max-w-md mx-auto py-16 px-4 text-center">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Authentication Required</h2>
            <p className="text-muted-foreground">Please log in to access this page.</p>
          </div>
          <Button onClick={login} disabled={loginStatus === 'logging-in'} size="lg">
            <LogIn className="mr-2 h-5 w-5" />
            {loginStatus === 'logging-in' ? 'Logging in...' : 'Login with Internet Identity'}
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
