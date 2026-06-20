import { User } from '@supabase/supabase-js';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { IGlobalStore } from './types.store';

export const useGlobalStore = create(
  subscribeWithSelector<IGlobalStore>((set) => ({
    user: null,
    setUser: (user: User | null) => set({ user })
  }))
);
