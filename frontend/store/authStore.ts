import { create } from 'zustand';

export interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  hydrate: (user: User | null, accessToken: string | null) => void;
}

export const authStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  login: (user, accessToken) =>
    set({ user, accessToken, isAuthenticated: true }),
  logout: () =>
    set({ user: null, accessToken: null, isAuthenticated: false }),
  hydrate: (user, accessToken) =>
    set({
      user,
      accessToken,
      isAuthenticated: !!(user && accessToken),
    }),
}));
