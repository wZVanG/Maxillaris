import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { User } from "@db/schema";

type AuthResponse = {
  message: string;
  token: string;
  user: User;
};

const getStoredToken = () => localStorage.getItem('token');
const setStoredToken = (token: string) => localStorage.setItem('token', token);
const removeStoredToken = () => localStorage.removeItem('token');

export function useUser() {
  const queryClient = useQueryClient();

  const { data: user, error, isLoading } = useQuery<User>({
    queryKey: ['/api/user'],
    queryFn: async () => {
      const token = getStoredToken();
      if (!token) return null;

      const res = await fetch('/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          removeStoredToken();
          return null;
        }
        throw new Error(await res.text());
      }

      return res.json();
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data: AuthResponse = await response.json();
      setStoredToken(data.token);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data: AuthResponse = await response.json();
      setStoredToken(data.token);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
  });

  const logout = () => {
    removeStoredToken();
    queryClient.invalidateQueries({ queryKey: ['/api/user'] });
  };

  return {
    user,
    isLoading,
    error,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout,
  };
}