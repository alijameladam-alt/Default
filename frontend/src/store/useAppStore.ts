import { create } from 'zustand';
import type { GeneratedPost, LinkedInProfile } from '../types';

interface AppState {
  // Step 1-2: upload & transcription
  jobId: string | null;
  transcript: string | null;

  // Step 3: generation
  summary: string | null;
  generatedPosts: GeneratedPost[];

  // LinkedIn auth (persists across pages)
  linkedinToken: string | null;
  linkedinProfile: LinkedInProfile | null;

  // Actions
  setJobId: (id: string) => void;
  setTranscript: (text: string) => void;
  setGenerated: (summary: string, posts: GeneratedPost[]) => void;
  updatePost: (index: number, text: string) => void;
  setLinkedinAuth: (token: string, profile: LinkedInProfile) => void;
  reset: () => void;
}

const initialState = {
  jobId: null,
  transcript: null,
  summary: null,
  generatedPosts: [],
  linkedinToken: null,
  linkedinProfile: null,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setJobId: (id) => set({ jobId: id }),
  setTranscript: (text) => set({ transcript: text }),
  setGenerated: (summary, posts) => set({ summary, generatedPosts: posts }),
  updatePost: (index, text) =>
    set((state) => {
      const posts = [...state.generatedPosts];
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      posts[index] = { ...posts[index], linkedin_post: text, word_count: words };
      return { generatedPosts: posts };
    }),
  setLinkedinAuth: (token, profile) =>
    set({ linkedinToken: token, linkedinProfile: profile }),
  reset: () => set(initialState),
}));
