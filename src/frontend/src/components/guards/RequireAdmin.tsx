import { ReactNode, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAdminSession } from '../../hooks/useAdminSession';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAdminAuthenticated, isLoading } = useAdminSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAdminAuthenticated) {
      navigate({ to: '/admin-login' });
    }
  }, [isAdminAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="container max-w-md mx-auto py-16 px-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Checking admin session...</p>
      </div>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <div className="container max-w-2xl mx-auto py-16 px-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You must be logged in as an admin to access this page. Redirecting to login...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
