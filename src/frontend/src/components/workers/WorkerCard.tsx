import { Link } from '@tanstack/react-router';
import { MapPin, Briefcase, User } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import type { WorkerProfile } from '../../backend';

interface WorkerCardProps {
  worker: WorkerProfile;
}

export default function WorkerCard({ worker }: WorkerCardProps) {
  const photoUrl = worker.photo?.getDirectURL();
  const initials = worker.full_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            {photoUrl && <AvatarImage src={photoUrl} alt={worker.full_name} />}
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-2 truncate">{worker.full_name}</h3>

            <div className="space-y-1 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 flex-shrink-0" />
                <span>{Number(worker.years_experience)} years experience</span>
              </div>
              {(worker.location.city || worker.location.district) && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {[worker.location.city, worker.location.district].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
            </div>

            <Link to="/worker/$workerId" params={{ workerId: worker.id }}>
              <Button variant="outline" size="sm" className="w-full">
                View Profile
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
