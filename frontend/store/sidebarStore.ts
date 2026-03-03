import { create } from 'zustand';

export interface TreeVideoItem {
  video: { id: string; title: string; order_index: number; [key: string]: unknown };
  is_completed: boolean;
  locked: boolean;
}

export interface TreeSectionItem {
  section: { id: string; title: string; order_index: number; [key: string]: unknown };
  videos: TreeVideoItem[];
}

export interface SubjectTree {
  subject: { id: string; title: string; slug: string; [key: string]: unknown };
  sections: TreeSectionItem[];
}

interface SidebarState {
  tree: SubjectTree | null;
  loading: boolean;
  error: string | null;
  notEnrolled: boolean;
  setTree: (tree: SubjectTree | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setNotEnrolled: (v: boolean) => void;
  markVideoCompleted: (videoId: string) => void;
  clear: () => void;
}

export const sidebarStore = create<SidebarState>((set) => ({
  tree: null,
  loading: false,
  error: null,
  notEnrolled: false,
  setTree: (tree) => set({ tree, error: null, notEnrolled: false }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setNotEnrolled: (notEnrolled) => set({ notEnrolled }),
  markVideoCompleted: (videoId) =>
    set((state) => {
      if (!state.tree) return state;
      return {
        tree: {
          ...state.tree,
          sections: state.tree.sections.map((sec) => ({
            ...sec,
            videos: sec.videos.map((v) =>
              v.video.id === videoId ? { ...v, is_completed: true } : v
            ),
          })),
        },
      };
    }),
  clear: () => set({ tree: null, loading: false, error: null, notEnrolled: false }),
}));
