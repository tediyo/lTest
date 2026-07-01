'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../services/auth.service';
import { AuthState, LoginFormData, RegisterFormData } from '../types/auth.types';

const TOKEN_KEY = 'auth_access_token';

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: false,
  });
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (data: LoginFormData) => {
      setState((prev) => ({ ...prev, isLoading: true }));
      setError(null);

      try {
        const response = await authService.login(data);

        if (response.success && response.data) {
          const { user, tokens } = response.data;
          sessionStorage.setItem(TOKEN_KEY, tokens.accessToken);

          setState({
            user,
            accessToken: tokens.accessToken,
            isAuthenticated: true,
            isLoading: false,
          });

          router.push('/dashboard');
        } else {
          throw new Error(response.message || 'Login failed');
        }
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as Error)?.message ||
          'An unexpected error occurred';

        setError(message);
        setState((prev) => ({ ...prev, isLoading: false }));
        throw err;
      }
    },
    [router],
  );

  const register = useCallback(
    async (data: RegisterFormData) => {
      setState((prev) => ({ ...prev, isLoading: true }));
      setError(null);

      try {
        const response = await authService.register(data);

        if (response.success && response.data) {
          const { user, tokens } = response.data;

          if (tokens.accessToken) {
            sessionStorage.setItem(TOKEN_KEY, tokens.accessToken);
            setState({
              user,
              accessToken: tokens.accessToken,
              isAuthenticated: true,
              isLoading: false,
            });
            router.push('/dashboard');
          } else {
            setState((prev) => ({ ...prev, isLoading: false }));
            router.push('/login?registered=1');
          }
        } else {
          throw new Error(response.message || 'Registration failed');
        }
      } catch (err: unknown) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          (err as Error)?.message ||
          'An unexpected error occurred';

        setError(message);
        setState((prev) => ({ ...prev, isLoading: false }));
        throw err;
      }
    },
    [router],
  );

  const logout = useCallback(async () => {
    const token = state.accessToken || sessionStorage.getItem(TOKEN_KEY);
    if (token) {
      try {
        await authService.logout(token);
      } catch {
        // Proceed with local logout even if API call fails
      }
    }
    sessionStorage.removeItem(TOKEN_KEY);
    setState({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
    router.push('/login');
  }, [state.accessToken, router]);

  return { ...state, error, login, register, logout };
}
