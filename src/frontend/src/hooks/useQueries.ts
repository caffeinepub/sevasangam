import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useAdminSession } from './useAdminSession';
import type { WorkerProfile, Category, Inquiry, UserProfile, ApprovalStatus, UserApprovalInfo } from '../backend';
import { Principal } from '@dfinity/principal';
import { toast } from 'sonner';
import { handleAdminApiError } from '../utils/adminApiErrorHandling';
import { useNavigate } from '@tanstack/react-router';

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
      if (!actor) return [];
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
      return actor.createCategory(session.username, 'Incorrect9978#*', category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      const message = handleAdminApiError(error);
      toast.error(message);
      if (message.includes('session has expired')) {
        navigate({ to: '/admin-login' });
      }
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
      return actor.updateCategory(session.username, 'Incorrect9978#*', categoryId, category);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      const message = handleAdminApiError(error);
      toast.error(message);
      if (message.includes('session has expired')) {
        navigate({ to: '/admin-login' });
      }
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
      return actor.deleteCategory(session.username, 'Incorrect9978#*', categoryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      const message = handleAdminApiError(error);
      toast.error(message);
      if (message.includes('session has expired')) {
        navigate({ to: '/admin-login' });
      }
    },
  });
}

// Workers - Public
export function useGetAllWorkers() {
  const { actor, isFetching } = useActor();

  return useQuery<WorkerProfile[]>({
    queryKey: ['workers'],
    queryFn: async () => {
      if (!actor) return [];
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
      if (!actor || !categoryId) return [];
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
      return actor.approveWorker(session.username, 'Incorrect9978#*', workerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
    onError: (error: any) => {
      const message = handleAdminApiError(error);
      toast.error(message);
      if (message.includes('session has expired')) {
        navigate({ to: '/admin-login' });
      }
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
      return actor.rejectWorker(session.username, 'Incorrect9978#*', workerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      queryClient.invalidateQueries({ queryKey: ['approvals'] });
    },
    onError: (error: any) => {
      const message = handleAdminApiError(error);
      toast.error(message);
      if (message.includes('session has expired')) {
        navigate({ to: '/admin-login' });
      }
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
      return actor.removeWorker(session.username, 'Incorrect9978#*', workerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workers'] });
    },
    onError: (error: any) => {
      const message = handleAdminApiError(error);
      toast.error(message);
      if (message.includes('session has expired')) {
        navigate({ to: '/admin-login' });
      }
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

  return useQuery<Inquiry[]>({
    queryKey: ['inquiries'],
    queryFn: async () => {
      if (!actor) return [];
      const session = getCredentials();
      if (!session) {
        throw new Error('Admin session not found');
      }
      try {
        return await actor.getAllInquiries(session.username, 'Incorrect9978#*');
      } catch (error: any) {
        // Handle error but return empty array to prevent breaking the UI
        console.error('Failed to fetch inquiries:', error);
        throw error;
      }
    },
    enabled: !!actor && !isFetching && !!getCredentials(),
    retry: false,
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
      return actor.updateInquiry(session.username, 'Incorrect9978#*', inquiryId, inquiry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
    },
    onError: (error: any) => {
      const message = handleAdminApiError(error);
      toast.error(message);
      if (message.includes('session has expired')) {
        navigate({ to: '/admin-login' });
      }
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
      return actor.deleteInquiry(session.username, 'Incorrect9978#*', inquiryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inquiries'] });
    },
    onError: (error: any) => {
      const message = handleAdminApiError(error);
      toast.error(message);
      if (message.includes('session has expired')) {
        navigate({ to: '/admin-login' });
      }
    },
  });
}

// Authorization
export function useIsCallerAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.isCallerAdmin();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}
