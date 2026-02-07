import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useAdminSession } from './useAdminSession';
import type { WorkerProfile, Category, Inquiry, UserProfile, ApprovalStatus, UserApprovalInfo, Status } from '../backend';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';
import { handleAdminApiErrorWithRedirect, isUnauthorizedError } from '../utils/adminApiErrorHandling';
import { useNavigate } from '@tanstack/react-router';
import { clearAdminSession } from '../utils/adminSessionStorage';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Categories
export function useGetAllCategories() {
  const { actor, isFetching } = useActor();

  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCategory(categoryId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Category | null>({
    queryKey: ['category', categoryId],
    queryFn: async () => {
      if (!actor || !categoryId) return null;
      return actor.getCategory(categoryId);
    },
    enabled: !!actor && !isFetching && !!categoryId,
  });
}

export function useCreateCategory() {
  const { actor } = useActor();
  const { getCredentials } = useAdminSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (category: Category) => {
      if (!actor) throw new Error('Actor not available');
      const session = getCredentials();
      if (!session) throw new Error('Admin session not found');
      return actor.createCategory(session.username, session.password, category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      const message = handleAdminApiErrorWithRedirect(error, navigate);
      toast.error(message);
    },
  });
}

export function useUpdateCategory() {
  const { actor } = useActor();
  const { getCredentials } = useAdminSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ categoryId, category }: { categoryId: string; category: Category }) => {
      if (!actor) throw new Error('Actor not available');
      const session = getCredentials();
      if (!session) throw new Error('Admin session not found');
      return actor.updateCategory(session.username, session.password, categoryId, category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      const message = handleAdminApiErrorWithRedirect(error, navigate);
      toast.error(message);
    },
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const { getCredentials } = useAdminSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (categoryId: string) => {
      if (!actor) throw new Error('Actor not available');
      const session = getCredentials();
      if (!session) throw new Error('Admin session not found');
      return actor.deleteCategory(session.username, session.password, categoryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      const message = handleAdminApiErrorWithRedirect(error, navigate);
      toast.error(message);
    },
  });
}

// Workers - Public
export function useGetAllWorkers() {
  const { actor, isFetching } = useActor();

  return useQuery<WorkerProfile[]>({
    queryKey: ['workers'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllWorkers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetWorkersByCategory(categoryId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<WorkerProfile[]>({
    queryKey: ['workers', 'category', categoryId],
    queryFn: async () => {
      if (!actor || !categoryId) throw new Error('Actor or category not available');
      return actor.getWorkersByCategory(categoryId);
    },
    enabled: !!actor && !isFetching && !!categoryId,
  });
}

export function useGetWorkerProfile(workerId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<WorkerProfile | null>({
    queryKey: ['worker', workerId],
    queryFn: async () => {
      if (!actor || !workerId) return null;
      return actor.getWorkerProfile(workerId);
    },
    enabled: !!actor && !isFetching && !!workerId,
  });
}

// Workers - Authenticated
export function useGetMyWorkerProfile() {
  const { actor, isFetching } = useActor();

  return useQuery<WorkerProfile | null>({
    queryKey: ['myWorkerProfile'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyWorkerProfile();
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useRegisterWorker() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: WorkerProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.registerWorker(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myWorkerProfile'] });
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      queryClient.invalidateQueries({ queryKey: ['workersAdmin'] });
    },
  });
}

export function useUpdateWorkerProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workerId, profile }: { workerId: string; profile: WorkerProfile }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateWorkerProfile(workerId, profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myWorkerProfile'] });
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      queryClient.invalidateQueries({ queryKey: ['workersAdmin'] });
    },
  });
}

// Workers - Admin (uses admin credentials)
export function useGetAllWorkersAdmin() {
  const { actor, isFetching } = useActor();
  const { getCredentials } = useAdminSession();
  const navigate = useNavigate();

  return useQuery<WorkerProfile[]>({
    queryKey: ['workersAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const session = getCredentials();
      if (!session) {
        clearAdminSession();
        throw new Error('Admin session not found');
      }
      try {
        return await actor.getAllWorkersAdmin(session.username, session.password);
      } catch (error: any) {
        // Check if unauthorized and handle redirect
        if (isUnauthorizedError(error)) {
          clearAdminSession();
          navigate({ to: '/admin-login' });
        }
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
    retry: (failureCount, error: any) => {
      // Don't retry on unauthorized errors
      if (isUnauthorizedError(error)) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Admin - Worker Management
export function useApproveWorker() {
  const { actor } = useActor();
  const { getCredentials } = useAdminSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (workerId: string) => {
      if (!actor) throw new Error('Actor not available');
      const session = getCredentials();
      if (!session) throw new Error('Admin session not found');
      return actor.approveWorker(session.username, session.password, workerId);
    },
    onSuccess: (_data, workerId) => {
      // Update admin workers cache immediately
      queryClient.setQueryData<WorkerProfile[]>(['workersAdmin'], (old) => {
        if (!old) return old;
        return old.map((w) =>
          w.id === workerId ? { ...w, status: 'approved' as Status } : w
        );
      });

      // Update public workers cache immediately
      queryClient.setQueryData<WorkerProfile[]>(['workers'], (old) => {
        if (!old) return old;
        const worker = old.find((w) => w.id === workerId);
        if (worker) {
          return old.map((w) =>
            w.id === workerId ? { ...w, status: 'approved' as Status } : w
          );
        }
        // Worker wasn't in public list (was pending), need to refetch
        return old;
      });

      // Invalidate all worker-related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      queryClient.invalidateQueries({ queryKey: ['workersAdmin'] });
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === 'workers' && key[1] === 'category';
        }
      });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
    onError: (error: any) => {
      const message = handleAdminApiErrorWithRedirect(error, navigate);
      toast.error(message);
    },
  });
}

export function useRejectWorker() {
  const { actor } = useActor();
  const { getCredentials } = useAdminSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (workerId: string) => {
      if (!actor) throw new Error('Actor not available');
      const session = getCredentials();
      if (!session) throw new Error('Admin session not found');
      return actor.rejectWorker(session.username, session.password, workerId);
    },
    onSuccess: (_data, workerId) => {
      // Update admin workers cache immediately
      queryClient.setQueryData<WorkerProfile[]>(['workersAdmin'], (old) => {
        if (!old) return old;
        return old.map((w) =>
          w.id === workerId ? { ...w, status: 'rejected' as Status } : w
        );
      });

      // Remove from public workers cache immediately
      queryClient.setQueryData<WorkerProfile[]>(['workers'], (old) => {
        if (!old) return old;
        return old.filter((w) => w.id !== workerId);
      });

      // Invalidate all worker-related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      queryClient.invalidateQueries({ queryKey: ['workersAdmin'] });
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === 'workers' && key[1] === 'category';
        }
      });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
    onError: (error: any) => {
      const message = handleAdminApiErrorWithRedirect(error, navigate);
      toast.error(message);
    },
  });
}

export function useRemoveWorker() {
  const { actor } = useActor();
  const { getCredentials } = useAdminSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (workerId: string) => {
      if (!actor) throw new Error('Actor not available');
      const session = getCredentials();
      if (!session) throw new Error('Admin session not found');
      return actor.removeWorker(session.username, session.password, workerId);
    },
    onSuccess: (_data, workerId) => {
      // Remove from admin workers cache immediately
      queryClient.setQueryData<WorkerProfile[]>(['workersAdmin'], (old) => {
        if (!old) return old;
        return old.filter((w) => w.id !== workerId);
      });

      // Remove from public workers cache immediately
      queryClient.setQueryData<WorkerProfile[]>(['workers'], (old) => {
        if (!old) return old;
        return old.filter((w) => w.id !== workerId);
      });

      // Invalidate all worker-related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      queryClient.invalidateQueries({ queryKey: ['workersAdmin'] });
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return Array.isArray(key) && key[0] === 'workers' && key[1] === 'category';
        }
      });
    },
    onError: (error: any) => {
      const message = handleAdminApiErrorWithRedirect(error, navigate);
      toast.error(message);
    },
  });
}

// Approvals
export function useListApprovals() {
  const { actor, isFetching } = useActor();

  return useQuery<UserApprovalInfo[]>({
    queryKey: ['approvals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listApprovals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsCallerApproved() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isApproved'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerApproved();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRequestApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.requestApproval();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['isApproved'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
}

export function useSetApproval() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, status }: { user: Principal; status: ApprovalStatus }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setApproval(user, status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
  });
}

// Inquiries
export function useGetAllInquiries() {
  const { actor, isFetching } = useActor();
  const { getCredentials } = useAdminSession();
  const navigate = useNavigate();

  return useQuery<Inquiry[]>({
    queryKey: ['inquiries'],
    queryFn: async () => {
      if (!actor) return [];
      const session = getCredentials();
      if (!session) {
        navigate({ to: '/admin-login' });
        return [];
      }
      try {
        return await actor.getAllInquiries(session.username, session.password);
      } catch (error: any) {
        handleAdminApiErrorWithRedirect(error, navigate);
        throw error;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateInquiry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inquiry: Inquiry) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createInquiry(inquiry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
    },
  });
}

export function useUpdateInquiry() {
  const { actor } = useActor();
  const { getCredentials } = useAdminSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ inquiryId, inquiry }: { inquiryId: string; inquiry: Inquiry }) => {
      if (!actor) throw new Error('Actor not available');
      const session = getCredentials();
      if (!session) throw new Error('Admin session not found');
      return actor.updateInquiry(session.username, session.password, inquiryId, inquiry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
    },
    onError: (error: any) => {
      const message = handleAdminApiErrorWithRedirect(error, navigate);
      toast.error(message);
    },
  });
}

export function useDeleteInquiry() {
  const { actor } = useActor();
  const { getCredentials } = useAdminSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (inquiryId: string) => {
      if (!actor) throw new Error('Actor not available');
      const session = getCredentials();
      if (!session) throw new Error('Admin session not found');
      return actor.deleteInquiry(session.username, session.password, inquiryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
    },
    onError: (error: any) => {
      const message = handleAdminApiErrorWithRedirect(error, navigate);
      toast.error(message);
    },
  });
}

export function useGetWorkerInquiries(workerId: string | undefined) {
  const { actor, isFetching } = useActor();

  return useQuery<Inquiry[]>({
    queryKey: ['workerInquiries', workerId],
    queryFn: async () => {
      if (!actor || !workerId) return [];
      return actor.getWorkerInquiries(workerId);
    },
    enabled: !!actor && !isFetching && !!workerId,
  });
}
