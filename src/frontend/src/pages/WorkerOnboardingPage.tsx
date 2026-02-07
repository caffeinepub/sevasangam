import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetMyWorkerProfile, useRegisterWorker, useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { LogIn, Loader2 } from 'lucide-react';
import WorkerRegistrationForm from '../components/workers/WorkerRegistrationForm';
import { toast } from 'sonner';
import { useState } from 'react';

export default function WorkerOnboardingPage() {
  const navigate = useNavigate();
  const { identity, login, loginStatus } = useInternetIdentity();
  const { data: workerProfile, isLoading: workerLoading } = useGetMyWorkerProfile();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const registerWorker = useRegisterWorker();
  const [userName, setUserName] = useState('');

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;
  const showWorkerRegistration = isAuthenticated && userProfile !== null && !workerProfile && !workerLoading;

  const handleProfileSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveProfile.mutateAsync({ name: userName, role: 'worker' });
      toast.success('Profile created successfully');
    } catch (error) {
      toast.error('Failed to create profile');
    }
  };

  const handleWorkerRegistration = async (profile: any) => {
    try {
      await registerWorker.mutateAsync(profile);
      toast.success('Registration submitted! Your profile is pending admin approval.');
      navigate({ to: '/dashboard' });
    } catch (error) {
      toast.error('Failed to submit registration');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container max-w-md mx-auto px-4 py-16">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Join as a Worker</CardTitle>
            <CardDescription>
              Sign in with Internet Identity to register as a service worker on SevaSangam
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={login}
              disabled={loginStatus === 'logging-in'}
              size="lg"
              className="w-full"
            >
              {loginStatus === 'logging-in' ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Login with Internet Identity
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profileLoading || workerLoading) {
    return (
      <div className="container px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <div className="container max-w-md mx-auto px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Welcome!</CardTitle>
            <CardDescription>Please tell us your name to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSetup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="userName">Your Name</Label>
                <Input
                  id="userName"
                  required
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <Button type="submit" disabled={saveProfile.isPending} size="lg" className="w-full">
                {saveProfile.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (workerProfile) {
    return (
      <div className="container max-w-md mx-auto px-4 py-16 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Already Registered</CardTitle>
            <CardDescription>You already have a worker profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate({ to: '/dashboard' })} size="lg" className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showWorkerRegistration) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-12">
        <div className="space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Worker Registration</h1>
            <p className="text-lg text-muted-foreground">
              Complete your profile to join SevaSangam as a service worker
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <WorkerRegistrationForm
                onSubmit={handleWorkerRegistration}
                isSubmitting={registerWorker.isPending}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
