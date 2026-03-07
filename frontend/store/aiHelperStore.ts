import { create } from 'zustand';

interface AIHelperState {
  course: string | null;
  lesson: string | null;
  code: string | null;
  /** When true, the floating AI chat panel is open. Used by dashboard "Ask AI" and the floating button. */
  openPanel: boolean;
  setCourse: (course: string | null) => void;
  setLesson: (lesson: string | null) => void;
  setCode: (code: string | null) => void;
  setOpenPanel: (open: boolean) => void;
}

export const aiHelperStore = create<AIHelperState>((set) => ({
  course: null,
  lesson: null,
  code: null,
  openPanel: false,
  setCourse: (course) => set({ course }),
  setLesson: (lesson) => set({ lesson }),
  setCode: (code) => set({ code }),
  setOpenPanel: (openPanel) => set({ openPanel }),
}));
