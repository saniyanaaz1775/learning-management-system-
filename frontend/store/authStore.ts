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
  isAdmin: boolean;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  setAdmin: (isAdmin: boolean) => void;
  login: (user: User, accessToken: string, isAdmin?: boolean) => void;
  logout: () => void;
  hydrate: (user: User | null, accessToken: string | null, isAdmin?: boolean) => void;
}

export const authStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isAdmin: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAccessToken: (accessToken) => set({ accessToken }),
  setAdmin: (isAdmin) => set({ isAdmin }),
  login: (user, accessToken, isAdmin = false) =>
    set({ user, accessToken, isAuthenticated: true, isAdmin }),
  logout: () =>
    set({ user: null, accessToken: null, isAuthenticated: false, isAdmin: false }),
  hydrate: (user, accessToken, isAdmin = false) =>
    set({
      user,
      accessToken,
      isAuthenticated: !!(user && accessToken),
      isAdmin,
    }),
}));
