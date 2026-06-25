import { User } from '@supabase/supabase-js';

export interface IGlobalStore {
  user?: User | null;
  /** False until the initial Supabase session has been resolved. */
  authReady: boolean;
  setUser: (user: User | null) => void;
  setAuthReady: (authReady: boolean) => void;
}

export interface IListStore {
  /** Current search text as typed by the user. */
  search: string;
  /** Number of Pokémon pre-fetched and visible (upper limit of loaded generations). */
  genReady: number;
  /** Saved vertical scroll position of the list. */
  scrollY: number;
  setSearch: (search: string) => void;
  setGenReady: (genReady: number) => void;
  setScrollY: (scrollY: number) => void;
}
