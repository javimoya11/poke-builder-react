import { useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useGlobalStore } from '../stores/useGlobalStore';

/**
 * Keeps the global store in sync with the Supabase session, making it the
 * single source of truth for `user`:
 * - Restores the persisted session on app load via `getSession`.
 * - Reacts to login / signup / logout / token refresh via `onAuthStateChange`.
 *
 * Must be mounted once at the app root level.
 */
export function useAuthSync() {
  const setUser = useGlobalStore((s) => s.setUser);
  const setAuthReady = useGlobalStore((s) => s.setAuthReady);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      setAuthReady(true);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [setUser, setAuthReady]);
}
