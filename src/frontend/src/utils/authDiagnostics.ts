/**
 * Structured console diagnostics for Internet Identity authentication flow.
 * Emits safe, non-sensitive context to help debug production login issues.
 */

interface AuthDiagnosticContext {
  timestamp: string;
  event: string;
  hadIdentityBefore?: boolean;
  configuredIIUrl?: string;
  userAgent?: string;
  currentUrl?: string;
  error?: any;
}

export function logAuthEvent(event: string, context?: Partial<AuthDiagnosticContext>) {
  const diagnosticEntry: AuthDiagnosticContext = {
    timestamp: new Date().toISOString(),
    event,
    currentUrl: window.location.href,
    userAgent: navigator.userAgent,
    ...context,
  };

  // Filter out any potential secrets
  const safeEntry = {
    ...diagnosticEntry,
    currentUrl: diagnosticEntry.currentUrl?.split('?')[0], // Remove query params that might contain tokens
  };

  console.log('[Auth Diagnostic]', safeEntry);
}

export function logLoginAttempt(hadIdentityBefore: boolean) {
  logAuthEvent('login_attempt_start', {
    hadIdentityBefore,
  });
}

export function logLoginSuccess() {
  logAuthEvent('login_success');
}

export function logLoginFailure(error: any, hadIdentityBefore: boolean) {
  logAuthEvent('login_failure', {
    hadIdentityBefore,
    error: {
      message: error?.message || 'Unknown error',
      name: error?.name,
      // Include stack only in development
      ...(import.meta.env.DEV && { stack: error?.stack }),
    },
  });
}
