import { useState } from 'react';
import { useGetAllWorkersAdmin, useApproveWorker, useRejectWorker, useRemoveWorker, usePublishWorker, useUnpublishWorker, useUpdateWorkerCategoryAdmin, useGetAllCategories, useGetAllInquiriesAdmin, useUpdateInquiry } from '../../hooks/useQueries';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CheckCircle, XCircle, Trash2, Eye, EyeOff, Loader2, Edit3, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { WorkerProfile, Inquiry } from '../../backend';
import { InquiryStatus } from '../../backend';

function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-6 max-w-md">{description}</p>}
    </div>
  );
}

export default function WorkersAdminPanel() {
  const { data: workers = [], isLoading } = useGetAllWorkersAdmin();
  const { data: categories = [] } = useGetAllCategories();
  const { data: inquiries = [] } = useGetAllInquiriesAdmin();
  const approveWorker = useApproveWorker();
  const rejectWorker = useRejectWorker();
  const removeWorker = useRemoveWorker();
  const publishWorker = usePublishWorker();
  const unpublishWorker = useUnpublishWorker();
  const updateCategory = useUpdateWorkerCategoryAdmin();
  const updateInquiry = useUpdateInquiry();
  const [changeCategoryDialog, setChangeCategoryDialog] = useState<{ open: boolean; worker: WorkerProfile | null }>({
    open: false,
    worker: null,
  });
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [completingInquiryId, setCompletingInquiryId] = useState<string | null>(null);

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

  const handlePublish = async (workerId: string) => {
    try {
      await publishWorker.mutateAsync(workerId);
      toast.success('Worker published');
    } catch (error) {
      toast.error('Failed to publish worker');
    }
  };

  const handleUnpublish = async (workerId: string) => {
    try {
      await unpublishWorker.mutateAsync(workerId);
      toast.success('Worker unpublished');
    } catch (error) {
      toast.error('Failed to unpublish worker');
    }
  };

  const handleOpenCategoryDialog = (worker: WorkerProfile) => {
    setSelectedCategoryId(worker.category_id);
    setChangeCategoryDialog({ open: true, worker });
  };

  const handleChangeCategory = async () => {
    if (!changeCategoryDialog.worker || !selectedCategoryId) return;
    try {
      await updateCategory.mutateAsync({
        workerId: changeCategoryDialog.worker.id,
        newCategoryId: selectedCategoryId,
      });
      toast.success('Worker category updated');
      setChangeCategoryDialog({ open: false, worker: null });
    } catch (error) {
      toast.error('Failed to update category');
    }
  };

  const handleMarkCompleted = async (inquiry: Inquiry) => {
    setCompletingInquiryId(inquiry.id);
    try {
      const updatedInquiry: Inquiry = {
        ...inquiry,
        status: InquiryStatus.completed,
      };
      await updateInquiry.mutateAsync({
        inquiryId: inquiry.id,
        inquiry: updatedInquiry,
      });
      toast.success('Job marked as completed');
    } catch (error) {
      toast.error('Failed to mark job as completed');
    } finally {
      setCompletingInquiryId(null);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || categoryId;
  };

  const getWorkerInquiries = (workerId: string) => {
    return inquiries.filter(inq => inq.worker_id === workerId);
  };

  const getStatusBadge = (status: InquiryStatus) => {
    if (status === InquiryStatus.completed) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Completed</Badge>;
    }
    if (status === InquiryStatus.pending) {
      return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Pending</Badge>;
    }
    return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">New</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (workers.length === 0) {
    return <EmptyState title="No workers registered yet" description="Workers will appear here once they register." />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Worker Management</h2>
      <div className="grid gap-4">
        {workers.map((worker) => {
          const workerInquiries = getWorkerInquiries(worker.id);
          return (
            <Card key={worker.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{worker.full_name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getCategoryName(worker.category_id)} • {worker.years_experience} years exp.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {worker.location.city || 'Location not specified'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex gap-2">
                      <Badge variant={worker.status === 'approved' ? 'default' : worker.status === 'pending' ? 'secondary' : 'destructive'}>
                        {worker.status}
                      </Badge>
                      {worker.published ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="outline">Unpublished</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {worker.status === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => handleApprove(worker.id)} disabled={approveWorker.isPending}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReject(worker.id)} disabled={rejectWorker.isPending}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}
                  {worker.status === 'approved' && (
                    <>
                      {worker.published ? (
                        <Button size="sm" variant="outline" onClick={() => handleUnpublish(worker.id)} disabled={unpublishWorker.isPending}>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Unpublish
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => handlePublish(worker.id)} disabled={publishWorker.isPending}>
                          <Eye className="mr-2 h-4 w-4" />
                          Publish
                        </Button>
                      )}
                    </>
                  )}
                  <Button size="sm" variant="outline" onClick={() => handleOpenCategoryDialog(worker)}>
                    <Edit3 className="mr-2 h-4 w-4" />
                    Change Category
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleRemove(worker.id)} disabled={removeWorker.isPending}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>

                {workerInquiries.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-semibold mb-3">Assigned Jobs ({workerInquiries.length})</h4>
                    <div className="space-y-2">
                      {workerInquiries.map((inquiry) => (
                        <div key={inquiry.id} className="flex items-start justify-between gap-4 p-3 bg-muted/50 rounded-lg">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusBadge(inquiry.status)}
                              <span className="text-xs text-muted-foreground">
                                {new Date(Number(inquiry.created_at) / 1000000).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm font-medium">{inquiry.customer_name || 'Anonymous'}</p>
                            <p className="text-xs text-muted-foreground">{inquiry.customer_contact || 'No contact'}</p>
                            <p className="text-sm mt-1 line-clamp-2">{inquiry.inquiry_text}</p>
                          </div>
                          {inquiry.status !== InquiryStatus.completed && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkCompleted(inquiry)}
                              disabled={completingInquiryId === inquiry.id}
                              className="shrink-0"
                            >
                              {completingInquiryId === inquiry.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Check className="mr-2 h-4 w-4" />
                                  Mark Completed
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={changeCategoryDialog.open} onOpenChange={(open) => setChangeCategoryDialog({ open, worker: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Worker Category</DialogTitle>
            <DialogDescription>
              Update the service category for {changeCategoryDialog.worker?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeCategoryDialog({ open: false, worker: null })}>
              Cancel
            </Button>
            <Button onClick={handleChangeCategory} disabled={updateCategory.isPending}>
              {updateCategory.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Update Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
