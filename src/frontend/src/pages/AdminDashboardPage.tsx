import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { LogOut } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import RequireAdmin from '../components/guards/RequireAdmin';
import WorkersAdminPanel from '../components/admin/WorkersAdminPanel';
import CategoriesAdminPanel from '../components/admin/CategoriesAdminPanel';
import InquiriesAdminPanel from '../components/admin/InquiriesAdminPanel';
import { useAdminSession } from '../hooks/useAdminSession';

function AdminDashboardContent() {
  const { logout } = useAdminSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout();
    queryClient.clear();
    navigate({ to: '/' });
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-12">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage workers, categories, and inquiries</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>

        <Tabs defaultValue="workers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="workers">Workers</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          </TabsList>

          <TabsContent value="workers">
            <WorkersAdminPanel />
          </TabsContent>

          <TabsContent value="categories">
            <CategoriesAdminPanel />
          </TabsContent>

          <TabsContent value="inquiries">
            <InquiriesAdminPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <RequireAdmin>
      <AdminDashboardContent />
    </RequireAdmin>
  );
}
