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
    retry: 1,
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
      if (!actor) throw new Error('Actor not available');
      return actor.getMyWorkerProfile();
    },
    enabled: !!actor && !isFetching,
    retry: 1,
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

// Workers - Admin
export function useGetAllWorkersAdmin() {
  const { actor, isFetching } = useActor();
  const { getCredentials } = useAdminSession();

  return useQuery<WorkerProfile[]>({
    queryKey: ['workersAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const session = getCredentials();
      if (!session) throw new Error('Admin session not found');
      return actor.getAllWorkersAdmin(session.username, session.password);
    },
    enabled: !!actor && !isFetching,
  });
}

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workersAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['workers'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workersAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['workers'] });
    },
    onError: (error: any) => {
      const message = handleAdminApiErrorWithRedirect(error, navigate);
      toast.error(message);
    },
  });
}

export function usePublishWorker() {
  const { actor } = useActor();
  const { getCredentials } = useAdminSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (workerId: string) => {
      if (!actor) throw new Error('Actor not available');
      const session = getCredentials();
      if (!session) throw new Error('Admin session not found');
      return actor.publishWorker(session.username, session.password, workerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workersAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['workers'] });
    },
    onError: (error: any) => {
      const message = handleAdminApiErrorWithRedirect(error, navigate);
      toast.error(message);
    },
  });
}

export function useUnpublishWorker() {
  const { actor } = useActor();
  const { getCredentials } = useAdminSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (workerId: string) => {
      if (!actor) throw new Error('Actor not available');
      const session = getCredentials();
      if (!session) throw new Error('Admin session not found');
      return actor.unpublishWorker(session.username, session.password, workerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workersAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['workers'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workersAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['workers'] });
    },
    onError: (error: any) => {
      const message = handleAdminApiErrorWithRedirect(error, navigate);
      toast.error(message);
    },
  });
}

export function useUpdateWorkerCategoryAdmin() {
  const { actor } = useActor();
  const { getCredentials } = useAdminSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ workerId, newCategoryId }: { workerId: string; newCategoryId: string }) => {
      if (!actor) throw new Error('Actor not available');
      const session = getCredentials();
      if (!session) throw new Error('Admin session not found');
      return actor.updateWorkerCategoryAdmin(session.username, session.password, workerId, newCategoryId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workersAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['workers'] });
    },
    onError: (error: any) => {
      const message = handleAdminApiErrorWithRedirect(error, navigate);
      toast.error(message);
    },
  });
}

// Inquiries
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

export function useGetAllInquiriesAdmin() {
  const { actor, isFetching } = useActor();
  const { getCredentials } = useAdminSession();

  return useQuery<Inquiry[]>({
    queryKey: ['inquiriesAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const session = getCredentials();
      if (!session) throw new Error('Admin session not found');
      return actor.getAllInquiries(session.username, session.password);
    },
    enabled: !!actor && !isFetching,
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
      queryClient.invalidateQueries({ queryKey: ['inquiriesAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['workerJobs'] });
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
      queryClient.invalidateQueries({ queryKey: ['inquiriesAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['workerJobs'] });
    },
    onError: (error: any) => {
      const message = handleAdminApiErrorWithRedirect(error, navigate);
      toast.error(message);
    },
  });
}

// Worker Jobs
export function useGetMyWorkItems() {
  const { actor, isFetching } = useActor();

  return useQuery<Inquiry[]>({
    queryKey: ['workerJobs', 'me'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMyWorkItems();
    },
    enabled: !!actor && !isFetching,
    retry: 1,
  });
}

export function useGetWorkerInquiriesAdmin() {
  const { actor } = useActor();
  const { getCredentials } = useAdminSession();

  return useMutation({
    mutationFn: async (workerId: string) => {
      if (!actor) throw new Error('Actor not available');
      const session = getCredentials();
      if (!session) throw new Error('Admin session not found');
      return actor.getWorkerInquiriesAdmin(session.username, session.password, workerId);
    },
  });
}

// User Approval
export function useIsCallerApproved() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isApproved'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
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
    },
  });
}

export function useListApprovals() {
  const { actor, isFetching } = useActor();

  return useQuery<UserApprovalInfo[]>({
    queryKey: ['approvals'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listApprovals();
    },
    enabled: !!actor && !isFetching,
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
