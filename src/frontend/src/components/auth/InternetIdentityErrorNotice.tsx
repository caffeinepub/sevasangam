import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';

interface InternetIdentityErrorNoticeProps {
  error?: any;
  onRetry: () => void;
}

export default function InternetIdentityErrorNotice({
  error,
  onRetry,
}: InternetIdentityErrorNoticeProps) {
  const errorMessage = error?.message || 'Login failed';

  return (
    <Alert variant="destructive" className="max-w-2xl mx-auto">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Login Failed</AlertTitle>
      <AlertDescription className="space-y-4">
        <p className="font-medium">{errorMessage}</p>
        <div className="space-y-2">
          <p className="text-sm font-semibold">Troubleshooting steps:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Allow pop-ups in your browser for this site</li>
            <li>Check your internet connection</li>
            <li>Make sure your device time is set to automatic</li>
            <li>Try using a different browser (Chrome or Safari recommended)</li>
            <li>Disable any VPN or proxy connections</li>
          </ul>
        </div>
        <Button onClick={onRetry} variant="outline" size="sm" className="mt-2">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </AlertDescription>
    </Alert>
  );
}
