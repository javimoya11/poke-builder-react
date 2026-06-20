import { User } from '@supabase/supabase-js';

export interface IGlobalStore {
  user?: User | null;
  setUser: (user: User | null) => void;
}
