import { clearAdminSession } from './adminSessionStorage';

export function isUnauthorizedError(error: any): boolean {
  const errorMessage = error?.message || String(error);
  return (
    errorMessage.includes('Unauthorized') ||
    errorMessage.includes('Only admins') ||
    errorMessage.includes('Admin privileges') ||
    errorMessage.includes('Admin session not found') ||
    errorMessage.includes('trap')
  );
}

export function isNetworkError(error: any): boolean {
  const errorMessage = error?.message || String(error);
  return (
    errorMessage.includes('fetch') ||
    errorMessage.includes('network') ||
    errorMessage.includes('Failed to fetch') ||
    errorMessage.includes('NetworkError') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('Connection')
  );
}

export function handleAdminApiError(error: any): string {
  if (isUnauthorizedError(error)) {
    clearAdminSession();
    return 'Your admin session has expired or is invalid. Please log in again.';
  }
  
  if (isNetworkError(error)) {
    return 'Connection problem. Please check your internet and try again.';
  }
  
  return 'An error occurred. Please try again.';
}

export function handleAdminApiErrorWithRedirect(error: any, navigate: (options: { to: string }) => void): string {
  const message = handleAdminApiError(error);
  
  if (isUnauthorizedError(error)) {
    // Redirect to login immediately for unauthorized errors
    setTimeout(() => {
      navigate({ to: '/admin-login' });
    }, 100);
  }
  
  return message;
}
