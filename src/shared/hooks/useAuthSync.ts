import { useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useGlobalStore } from '../stores/useGlobalStore';

/**
 * Mantiene el store sincronizado con la sesión de Supabase y lo convierte en la
 * única fuente de verdad del `user`:
 * - Restaura la sesión persistida al cargar la app (getSession).
 * - Reacciona a login / signup / logout / refresh de token (onAuthStateChange).
 *
 * Debe montarse una sola vez, a nivel de app.
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
