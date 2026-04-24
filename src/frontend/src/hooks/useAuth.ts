import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";

export function useAuth() {
  const {
    login,
    clear,
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    identity,
  } = useInternetIdentity();
  const queryClient = useQueryClient();

  const handleLogin = () => {
    if (!isAuthenticated) {
      login();
    }
  };

  const handleLogout = () => {
    clear();
    queryClient.clear();
  };

  const principalId = identity?.getPrincipal().toString();

  return {
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    identity,
    principalId,
    login: handleLogin,
    logout: handleLogout,
  };
}
