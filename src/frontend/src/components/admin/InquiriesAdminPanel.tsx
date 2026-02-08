import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetAllInquiriesAdmin, useUpdateInquiry, useDeleteInquiry } from '../../hooks/useQueries';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Trash2, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '../ui/alert';
import type { Inquiry } from '../../backend';
import { InquiryStatus } from '../../backend';
import { handleAdminApiError } from '../../utils/adminApiErrorHandling';

function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-6 max-w-md">{description}</p>}
    </div>
  );
}

export default function InquiriesAdminPanel() {
  const { data: inquiries = [], isLoading, error } = useGetAllInquiriesAdmin();
  const updateInquiry = useUpdateInquiry();
  const deleteInquiry = useDeleteInquiry();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [markingCompletedId, setMarkingCompletedId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Handle query errors
  useEffect(() => {
    if (error) {
      const message = handleAdminApiError(error);
      toast.error(message);
      if (message.includes('session has expired')) {
        navigate({ to: '/admin-login' });
      }
    }
  }, [error, navigate]);

  const filteredInquiries = Array.isArray(inquiries) ? inquiries.filter((inq) => {
    if (statusFilter === 'all') return true;
    return inq.status === statusFilter;
  }) : [];

  const handleStatusChange = async (inquiry: Inquiry, newStatus: string) => {
    try {
      await updateInquiry.mutateAsync({
        inquiryId: inquiry.id,
        inquiry: { ...inquiry, status: newStatus as any },
      });
      toast.success('Inquiry status updated');
    } catch (error) {
      toast.error('Failed to update inquiry');
    }
  };

  const handleMarkCompleted = async (inquiry: Inquiry) => {
    setMarkingCompletedId(inquiry.id);
    try {
      await updateInquiry.mutateAsync({
        inquiryId: inquiry.id,
        inquiry: { ...inquiry, status: InquiryStatus.completed },
      });
      toast.success('Job marked as completed');
    } catch (error) {
      toast.error('Failed to mark job as completed');
    } finally {
      setMarkingCompletedId(null);
    }
  };

  const handleDelete = async (inquiryId: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;
    try {
      await deleteInquiry.mutateAsync(inquiryId);
      toast.success('Inquiry deleted');
    } catch (error) {
      toast.error('Failed to delete inquiry');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load inquiries. Please check your admin session and try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Inquiry Management</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Inquiries</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredInquiries.length === 0 ? (
        <EmptyState title="No inquiries found" description="No inquiries match the selected filter." />
      ) : (
        <div className="grid gap-4">
          {filteredInquiries.map((inquiry) => {
            const isCompleted = inquiry.status === InquiryStatus.completed;
            const isMarkingThisInquiry = markingCompletedId === inquiry.id;

            return (
              <Card key={inquiry.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {inquiry.customer_name || 'Anonymous'} - {inquiry.inquiry_type}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Worker ID: {inquiry.worker_id}
                      </p>
                    </div>
                    <Badge>{inquiry.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm">{inquiry.inquiry_text}</p>
                    {inquiry.customer_contact && (
                      <p className="text-sm text-muted-foreground">
                        Contact: {inquiry.customer_contact}
                      </p>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      <Select
                        value={inquiry.status}
                        onValueChange={(value) => handleStatusChange(inquiry, value)}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      {!isCompleted && (
                        <Button
                          size="sm"
                          onClick={() => handleMarkCompleted(inquiry)}
                          disabled={isMarkingThisInquiry || markingCompletedId !== null}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          {isMarkingThisInquiry ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Marking...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Mark Completed
                            </>
                          )}
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(inquiry.id)}
                        disabled={deleteInquiry.isPending}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
