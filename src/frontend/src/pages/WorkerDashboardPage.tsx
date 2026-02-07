import { useState } from 'react';
import { useGetMyWorkerProfile, useUpdateWorkerProfile } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Loader2, Edit } from 'lucide-react';
import RequireAuth from '../components/guards/RequireAuth';
import WorkerProfileEditor from '../components/workers/WorkerProfileEditor';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';

function WorkerDashboardContent() {
  const navigate = useNavigate();
  const { data: workerProfile, isLoading } = useGetMyWorkerProfile();
  const updateProfile = useUpdateWorkerProfile();
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = async (profile: any) => {
    try {
      await updateProfile.mutateAsync({ workerId: profile.id, profile });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <div className="container px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!workerProfile) {
    return (
      <div className="container max-w-md mx-auto px-4 py-16 text-center">
        <Card>
          <CardHeader>
            <CardTitle>No Worker Profile</CardTitle>
            <CardDescription>You haven't registered as a worker yet</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/join' })} size="lg" className="w-full">
              Register as Worker
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      pending: { variant: 'secondary', label: 'Pending Approval' },
      approved: { variant: 'default', label: 'Approved' },
      rejected: { variant: 'destructive', label: 'Rejected' },
      featured: { variant: 'default', label: 'Featured' },
    };
    const { variant, label } = config[status] || { variant: 'secondary', label: status };
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getStatusMessage = (status: string) => {
    const messages: Record<string, string> = {
      pending: 'Your profile is currently under review by our admin team. You will be notified once approved.',
      approved: 'Your profile is live and visible to customers!',
      rejected: 'Your profile was not approved. Please contact support for more information.',
    };
    return messages[status] || '';
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-12">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Worker Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage your profile and view your status</p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Profile Status</CardTitle>
              {getStatusBadge(workerProfile.status)}
            </div>
            <CardDescription>{getStatusMessage(workerProfile.status)}</CardDescription>
          </CardHeader>
        </Card>

        {isEditing ? (
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
              <CardDescription>
                Note: Major changes will require admin re-approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WorkerProfileEditor
                profile={workerProfile}
                onSubmit={handleUpdate}
                isSubmitting={updateProfile.isPending}
              />
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="mt-4"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold">Name</p>
                  <p className="text-muted-foreground">{workerProfile.full_name}</p>
                </div>
                <div>
                  <p className="font-semibold">Phone</p>
                  <p className="text-muted-foreground">{workerProfile.phone_number}</p>
                </div>
                <div>
                  <p className="font-semibold">Experience</p>
                  <p className="text-muted-foreground">{Number(workerProfile.years_experience)} years</p>
                </div>
                <div>
                  <p className="font-semibold">Location</p>
                  <p className="text-muted-foreground">
                    {[workerProfile.location.city, workerProfile.location.district].filter(Boolean).join(', ')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
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
