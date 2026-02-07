import { clearAdminSession } from './adminSessionStorage';

export function isUnauthorizedError(error: any): boolean {
  const errorMessage = error?.message || String(error);
  return (
    errorMessage.includes('Unauthorized') ||
    errorMessage.includes('Only admins') ||
    errorMessage.includes('Admin privileges')
  );
}

export function handleAdminApiError(error: any): string {
  if (isUnauthorizedError(error)) {
    clearAdminSession();
    return 'Your admin session has expired. Please log in again.';
  }
  return 'An error occurred. Please try again.';
}
