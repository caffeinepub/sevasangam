import { useInternetIdentity } from './useInternetIdentity';
import { useAdminSession } from './useAdminSession';

export function useAuthz() {
  const { identity } = useInternetIdentity();
  const { isAdminAuthenticated } = useAdminSession();

  const isWorkerAuthenticated = !!identity;

  return {
    isAuthenticated: isWorkerAuthenticated,
    isWorkerAuthenticated,
    isAdminSessionAuthenticated: isAdminAuthenticated,
    isAdmin: isAdminAuthenticated,
    isAdminLoading: false,
  };
}
