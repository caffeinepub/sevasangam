import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { CheckCircle2, Clock } from 'lucide-react';
import type { Inquiry } from '../../backend';
import { InquiryStatus } from '../../backend';

interface WorkerJobsListProps {
  jobs: Inquiry[];
}

export default function WorkerJobsList({ jobs }: WorkerJobsListProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <Clock className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No jobs assigned yet</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          When customers contact you, their inquiries will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {jobs.map((job) => {
        const isCompleted = job.status === InquiryStatus.completed;

        return (
          <Card key={job.id} className="border-l-4" style={{ borderLeftColor: isCompleted ? 'oklch(0.65 0.15 145)' : 'oklch(0.75 0.15 65)' }}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    {job.customer_name || 'Customer'}
                    {isCompleted ? (
                      <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </CardTitle>
                  {job.customer_contact && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Contact: {job.customer_contact}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-1">Request:</p>
                <p className="text-sm text-muted-foreground">{job.inquiry_text}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                Type: {job.inquiry_type} • Created: {new Date(Number(job.created_at) / 1000000).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
