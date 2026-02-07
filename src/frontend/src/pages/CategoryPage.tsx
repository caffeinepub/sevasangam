import { useParams } from '@tanstack/react-router';
import { useGetWorkersByCategory } from '../hooks/useQueries';
import { Loader2, AlertCircle } from 'lucide-react';
import WorkerCard from '../components/workers/WorkerCard';
import { CATEGORY_NAMES } from '../utils/categories';
import { Button } from '../components/ui/button';

function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-6 max-w-md">{description}</p>}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-lg font-semibold mb-2">Connection Problem</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">{message}</p>
      <Button onClick={onRetry}>Try Again</Button>
    </div>
  );
}

export default function CategoryPage() {
  const { categoryId } = useParams({ from: '/category/$categoryId' });
  const { data: workers = [], isLoading, isError, error, refetch } = useGetWorkersByCategory(categoryId);

  const categoryName = CATEGORY_NAMES[categoryId] || categoryId;

  if (isLoading) {
    return (
      <div className="container px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container px-4 py-12">
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">{categoryName}</h1>
          </div>
          <ErrorState 
            message="Unable to load workers. Please check your connection and try again."
            onRetry={() => refetch()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-12">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">{categoryName}</h1>
          <p className="text-lg text-muted-foreground">
            {workers.length} approved {workers.length === 1 ? 'worker' : 'workers'} available
          </p>
        </div>

        {workers.length === 0 ? (
          <EmptyState
            title="No workers found"
            description={`No approved workers are currently available in the ${categoryName} category.`}
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map((worker) => (
              <WorkerCard key={worker.id} worker={worker} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
