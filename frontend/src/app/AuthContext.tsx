import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../lib/api-client';

export type UserRole = 'admin' | 'sales_manager' | 'sales_rep' | 'lead_researcher' | 'marketing' | 'telecaller';
export type AuthUser = { id: number; fullName: string; email: string; role: UserRole; permissions: string[] };
type AuthContextValue = { user: AuthUser | null; loading: boolean; signIn(email: string, password: string): Promise<void>; signOut(): void; can(permission: string): boolean };
type AuthResponse = { token: string; user: AuthUser };

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const expireSession = () => { api.setToken(null); setUser(null); queryClient.clear(); };
    window.addEventListener('velvorax:unauthorized', expireSession);
    if (!localStorage.getItem('velvorax_access_token')) setLoading(false);
    else api.get<AuthUser>('/auth/me').then(setUser).catch(() => api.setToken(null)).finally(() => setLoading(false));
    return () => window.removeEventListener('velvorax:unauthorized', expireSession);
  }, [queryClient]);

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    queryClient.clear();
    api.setToken(response.token);
    setUser(response.user);
  }, [queryClient]);

  const signOut = useCallback(() => { api.setToken(null); setUser(null); queryClient.clear(); }, [queryClient]);
  const value = useMemo(() => ({ user, loading, signIn, signOut, can: (permission: string) => Boolean(user?.permissions.includes(permission)) }), [user, loading, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}

export function isUnauthorized(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401;
}
