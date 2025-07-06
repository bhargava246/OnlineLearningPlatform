import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface User {
  _id: string;
  username: string;
  email: string;
  role: "buyer" | "seller";
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          return null;
        }

        const response = await fetch("/api/auth/me", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          return null;
        }
        if (!response.ok) {
          throw new Error('Failed to fetch user');
        }
        return await response.json();
      } catch (error) {
        localStorage.removeItem('authToken');
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      localStorage.removeItem('authToken');
      return { message: 'Logged out successfully' };
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isBuyer: user?.role === "buyer",
    isSeller: user?.role === "seller",
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}