const ADMIN_SESSION_KEY = 'sevasangam_admin_session';

export interface AdminSession {
  username: string;
  timestamp: number;
}

export function saveAdminSession(username: string): void {
  const session: AdminSession = {
    username,
    timestamp: Date.now(),
  };
  sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

export function getAdminSession(): AdminSession | null {
  try {
    const stored = sessionStorage.getItem(ADMIN_SESSION_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as AdminSession;
  } catch {
    return null;
  }
}

export function clearAdminSession(): void {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export function isAdminSessionActive(): boolean {
  return getAdminSession() !== null;
}
