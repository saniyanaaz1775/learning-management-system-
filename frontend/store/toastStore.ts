import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  createdAt: number;
}

interface ToastState {
  toasts: ToastItem[];
  add: (message: string, variant?: ToastVariant) => void;
  remove: (id: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

export const toastStore = create<ToastState>((set, get) => ({
  toasts: [],
  add: (message, variant = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, variant, createdAt: Date.now() }].slice(-5),
    }));
    setTimeout(() => get().remove(id), 4000);
  },
  remove: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  success: (message) => get().add(message, 'success'),
  error: (message) => get().add(message, 'error'),
  info: (message) => get().add(message, 'info'),
}));
