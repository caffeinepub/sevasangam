import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Button } from '../ui/button';

interface ConnectionErrorNoticeProps {
  onRetry: () => void;
  title?: string;
  message?: string;
}

export default function ConnectionErrorNotice({
  onRetry,
  title = 'Connection Problem',
  message = 'We couldn\'t connect to the server. Please check your internet connection and try again.',
}: ConnectionErrorNoticeProps) {
  return (
    <Alert variant="destructive" className="max-w-2xl mx-auto">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="space-y-4">
        <p>{message}</p>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Check your internet connection</li>
          <li>Disable VPN if active</li>
          <li>Try refreshing the page</li>
        </ul>
        <Button onClick={onRetry} variant="outline" size="sm" className="mt-2">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}
