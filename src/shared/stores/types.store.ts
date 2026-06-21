import { User } from '@supabase/supabase-js';

export interface IGlobalStore {
  user?: User | null;
  /** false hasta que se resuelve la sesión inicial de Supabase. */
  authReady: boolean;
  setUser: (user: User | null) => void;
  setAuthReady: (authReady: boolean) => void;
}

export interface IListStore {
  /** Texto de búsqueda actual (en crudo, tal y como lo escribe el usuario). */
  search: string;
  /** Cuántos pokémon hay precargados/visibles (límite de generaciones cargadas). */
  genReady: number;
  /** Posición de scroll vertical guardada de la lista. */
  scrollY: number;
  setSearch: (search: string) => void;
  setGenReady: (genReady: number) => void;
  setScrollY: (scrollY: number) => void;
}
