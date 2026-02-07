import { useSearch } from '@tanstack/react-router';
import { useGetAllWorkers } from '../hooks/useQueries';
import { Button } from '../components/ui/button';
import { X, Loader2 } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import WorkerCard from '../components/workers/WorkerCard';
import { useNavigate } from '@tanstack/react-router';

function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-6 max-w-md">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

export default function SearchResultsPage() {
  const search = useSearch({ from: '/search' }) as any;
  const navigate = useNavigate();
  const { data: allWorkers = [], isLoading } = useGetAllWorkers();

  const { category, location, availability } = search;

  const filteredWorkers = allWorkers.filter((worker) => {
    if (category && worker.category_id !== category) return false;
    if (location) {
      const locationLower = location.toLowerCase();
      const cityMatch = worker.location.city?.toLowerCase().includes(locationLower);
      const districtMatch = worker.location.district?.toLowerCase().includes(locationLower);
      if (!cityMatch && !districtMatch) return false;
    }
    if (availability) {
      const isFullTime = worker.availability.available_days.length === 7;
      const workerAvailability = isFullTime ? 'full-time' : 'part-time';
      if (workerAvailability !== availability) return false;
    }
    return true;
  });

  const handleClearFilters = () => {
    navigate({ to: '/search', search: {} });
  };

  const hasFilters = category || location || availability;

  if (isLoading) {
    return (
      <div className="container px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container px-4 py-12">
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Search Results</h1>
          
          {hasFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {category && <Badge variant="secondary">Category: {category}</Badge>}
              {location && <Badge variant="secondary">Location: {location}</Badge>}
              {availability && <Badge variant="secondary">Availability: {availability}</Badge>}
              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear all
              </Button>
            </div>
          )}

          <p className="text-lg text-muted-foreground">
            {filteredWorkers.length} {filteredWorkers.length === 1 ? 'worker' : 'workers'} found
          </p>
        </div>

        {filteredWorkers.length === 0 ? (
          <EmptyState
            title="No approved workers found"
            description="Try adjusting your filters or search criteria."
            action={
              hasFilters ? (
                <Button onClick={handleClearFilters}>Clear Filters</Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
