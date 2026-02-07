import { useParams } from '@tanstack/react-router';
import { useGetWorkerProfile } from '../hooks/useQueries';
import { MapPin, Briefcase, Clock, DollarSign, User, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import WorkerContactActions from '../components/workers/WorkerContactActions';
import { CATEGORY_NAMES } from '../utils/categories';

export default function WorkerProfilePage() {
  const { workerId } = useParams({ from: '/worker/$workerId' });
  const { data: worker, isLoading } = useGetWorkerProfile(workerId);

  if (isLoading) {
    return (
      <div className="container px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="container px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-2">Worker Not Found</h2>
        <p className="text-muted-foreground">This worker profile is not available or has not been approved yet.</p>
      </div>
    );
  }

  const photoUrl = worker.photo?.getDirectURL();
  const categoryName = CATEGORY_NAMES[worker.category_id] || worker.category_id;
  const isFullTime = worker.availability.available_days.length === 7;

  return (
    <div className="container max-w-4xl px-4 py-12">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24">
              {photoUrl && <AvatarImage src={photoUrl} alt={worker.full_name} />}
              <AvatarFallback>
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <div>
                <CardTitle className="text-3xl mb-2">{worker.full_name}</CardTitle>
                <Badge className="text-base">{categoryName}</Badge>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4 flex-shrink-0" />
                  <span>{Number(worker.years_experience)} years experience</span>
                </div>

                {(worker.location.city || worker.location.district) && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span>{[worker.location.city, worker.location.district].filter(Boolean).join(', ')}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span>{isFullTime ? 'Full-time' : 'Part-time'}</span>
                </div>

                {worker.pricing.rate_per_hour && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <DollarSign className="h-4 w-4 flex-shrink-0" />
                    <span>₹{Number(worker.pricing.rate_per_hour)}/hour</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <WorkerContactActions phoneNumber={worker.phone_number} workerName={worker.full_name} />

          {worker.location.address && (
            <div className="space-y-2">
              <h3 className="font-semibold">Address</h3>
              <p className="text-muted-foreground">{worker.location.address}</p>
            </div>
          )}

          {worker.pricing.special_offers && worker.pricing.special_offers.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Special Offers</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {worker.pricing.special_offers.map((offer, idx) => (
                  <li key={idx}>{offer}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
