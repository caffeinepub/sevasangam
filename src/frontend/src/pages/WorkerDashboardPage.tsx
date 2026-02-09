import { useState } from 'react';
import { useGetMyWorkerProfile, useUpdateWorkerProfile, useGetMyWorkItems } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Loader2, Edit, Briefcase, AlertCircle } from 'lucide-react';
import RequireAuth from '../components/guards/RequireAuth';
import WorkerProfileEditor from '../components/workers/WorkerProfileEditor';
import WorkerJobsList from '../components/workers/WorkerJobsList';
import ConnectionErrorNotice from '../components/errors/ConnectionErrorNotice';
import PostCallAlarmHost from '../components/alarms/PostCallAlarmHost';

function WorkerDashboardContent() {
  const { data: profile, isLoading: profileLoading, error: profileError, refetch: refetchProfile } = useGetMyWorkerProfile();
  const { data: jobs = [], isLoading: jobsLoading, error: jobsError, refetch: refetchJobs } = useGetMyWorkItems();
  const updateProfile = useUpdateWorkerProfile();
  const [isEditing, setIsEditing] = useState(false);

  const isConnectionError = (error: any) => {
    if (!error) return false;
    const message = error?.message?.toLowerCase() || '';
    return message.includes('fetch') || message.includes('network') || message.includes('connection');
  };

  const handleRetry = () => {
    refetchProfile();
    refetchJobs();
  };

  if (profileLoading || jobsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (profileError && isConnectionError(profileError)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ConnectionErrorNotice onRetry={handleRetry} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Worker Profile Not Found</CardTitle>
            <CardDescription>
              You need to register as a worker first. Please complete the worker registration process.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (updatedProfile: any) => {
    try {
      await updateProfile.mutateAsync({
        workerId: profile.id,
        profile: updatedProfile,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: 'Pending Approval', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
      approved: { label: 'Approved', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
      featured: { label: 'Featured', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
    };
    const config = statusMap[status] || { label: status, className: '' };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <PostCallAlarmHost />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Worker Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your profile and track your jobs</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Your worker profile information</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(profile.status)}
              {!profile.published && (
                <Badge variant="outline" className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Unpublished
                </Badge>
              )}
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div>
              <WorkerProfileEditor
                profile={profile}
                onSubmit={handleSubmit}
                isSubmitting={updateProfile.isPending}
              />
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)} 
                className="w-full mt-4"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="text-base">{profile.full_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="text-base">{profile.phone_number}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Experience</p>
                  <p className="text-base">{profile.years_experience} years</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p className="text-base">{profile.location.city || 'Not specified'}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            <CardTitle>My Jobs</CardTitle>
          </div>
          <CardDescription>
            Track and manage your assigned customer inquiries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {jobsError && isConnectionError(jobsError) ? (
            <div className="py-4">
              <ConnectionErrorNotice onRetry={refetchJobs} />
            </div>
          ) : jobsError ? (
            <div className="flex items-center gap-2 text-destructive py-4">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Failed to load jobs. Please try again.</span>
            </div>
          ) : (
            <WorkerJobsList jobs={jobs} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function WorkerDashboardPage() {
  return (
    <RequireAuth>
      <WorkerDashboardContent />
    </RequireAuth>
  );
}
