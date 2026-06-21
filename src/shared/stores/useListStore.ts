import { create } from 'zustand';
import { IListStore } from './types.store';

export const useListStore = create<IListStore>((set) => ({
  search: '',
  genReady: 0,
  scrollY: 0,
  setSearch: (search) => set({ search }),
  setGenReady: (genReady) => set({ genReady }),
  setScrollY: (scrollY) => set({ scrollY })
}));
