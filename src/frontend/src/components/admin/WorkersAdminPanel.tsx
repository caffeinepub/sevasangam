import { useState } from 'react';
import { useGetAllWorkers, useApproveWorker, useRejectWorker, useRemoveWorker } from '../../hooks/useQueries';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CheckCircle, XCircle, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { WorkerProfile } from '../../backend';
import { CATEGORY_NAMES } from '../../utils/categories';

function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-6 max-w-md">{description}</p>}
    </div>
  );
}

export default function WorkersAdminPanel() {
  const { data: workers = [], isLoading } = useGetAllWorkers();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const approveWorker = useApproveWorker();
  const rejectWorker = useRejectWorker();
  const removeWorker = useRemoveWorker();

  const filteredWorkers = workers.filter((w) => {
    if (statusFilter === 'all') return true;
    return w.status === statusFilter;
  });

  const handleApprove = async (workerId: string) => {
    try {
      await approveWorker.mutateAsync(workerId);
      toast.success('Worker approved successfully');
    } catch (error) {
      toast.error('Failed to approve worker');
    }
  };

  const handleReject = async (workerId: string) => {
    try {
      await rejectWorker.mutateAsync(workerId);
      toast.success('Worker rejected');
    } catch (error) {
      toast.error('Failed to reject worker');
    }
  };

  const handleRemove = async (workerId: string) => {
    if (!confirm('Are you sure you want to remove this worker?')) return;
    try {
      await removeWorker.mutateAsync(workerId);
      toast.success('Worker removed');
    } catch (error) {
      toast.error('Failed to remove worker');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
      featured: 'default',
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Worker Management</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Workers</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredWorkers.length === 0 ? (
        <EmptyState title="No workers found" description="No workers match the selected filter." />
      ) : (
        <div className="grid gap-4">
          {filteredWorkers.map((worker) => (
            <Card key={worker.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{worker.full_name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {CATEGORY_NAMES[worker.category_id] || worker.category_id}
                    </p>
                  </div>
                  {getStatusBadge(worker.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm mb-4">
                  <p>
                    <strong>Phone:</strong> {worker.phone_number}
                  </p>
                  <p>
                    <strong>Location:</strong> {[worker.location.city, worker.location.district].filter(Boolean).join(', ')}
                  </p>
                  <p>
                    <strong>Experience:</strong> {Number(worker.years_experience)} years
                  </p>
                </div>

                <div className="flex gap-2">
                  {worker.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(worker.id)}
                        disabled={approveWorker.isPending}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(worker.id)}
                        disabled={rejectWorker.isPending}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}
                  {worker.status === 'rejected' && (
                    <Button
                      size="sm"
                      onClick={() => handleApprove(worker.id)}
                      disabled={approveWorker.isPending}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  )}
                  {worker.status === 'approved' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(worker.id)}
                      disabled={rejectWorker.isPending}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRemove(worker.id)}
                    disabled={removeWorker.isPending}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
