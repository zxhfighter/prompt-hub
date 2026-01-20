import { create } from 'zustand';
import type { PromptStatus } from '@/types';

interface FilterState {
  search: string;
  status: PromptStatus | 'all';
  tagIds: string[];
  sortBy: 'updatedAt' | 'createdAt' | 'title';
  sortOrder: 'asc' | 'desc';
  
  setSearch: (search: string) => void;
  setStatus: (status: PromptStatus | 'all') => void;
  setTagIds: (tagIds: string[]) => void;
  toggleTag: (tagId: string) => void;
  setSortBy: (sortBy: 'updatedAt' | 'createdAt' | 'title') => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  reset: () => void;
}

const initialState = {
  search: '',
  status: 'all' as const,
  tagIds: [],
  sortBy: 'updatedAt' as const,
  sortOrder: 'desc' as const,
};

export const useFilterStore = create<FilterState>((set) => ({
  ...initialState,
  
  setSearch: (search) => set({ search }),
  
  setStatus: (status) => set({ status }),
  
  setTagIds: (tagIds) => set({ tagIds }),
  
  toggleTag: (tagId) =>
    set((state) => ({
      tagIds: state.tagIds.includes(tagId)
        ? state.tagIds.filter((id) => id !== tagId)
        : [...state.tagIds, tagId],
    })),
  
  setSortBy: (sortBy) => set({ sortBy }),
  
  setSortOrder: (sortOrder) => set({ sortOrder }),
  
  reset: () => set(initialState),
}));
