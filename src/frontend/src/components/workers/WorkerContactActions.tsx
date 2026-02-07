import { Button } from '../ui/button';
import { Phone, MessageCircle } from 'lucide-react';
import { createTelLink, createWhatsAppLink } from '../../utils/contactLinks';

interface WorkerContactActionsProps {
  phoneNumber: string;
  workerName: string;
}

export default function WorkerContactActions({ phoneNumber, workerName }: WorkerContactActionsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Button asChild size="lg" className="flex-1">
        <a href={createTelLink(phoneNumber)}>
          <Phone className="mr-2 h-5 w-5" />
          Call Now
        </a>
      </Button>
      <Button asChild variant="outline" size="lg" className="flex-1">
        <a href={createWhatsAppLink(phoneNumber, `Hi ${workerName}, I found you on SevaSangam.`)} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="mr-2 h-5 w-5" />
          WhatsApp
        </a>
      </Button>
    </div>
  );
}
