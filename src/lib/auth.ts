import { supabase } from './supabase';

export async function signUp(email: string, password: string) {
  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin
    }
  });

  if (error) {
    return { error, data };
  }

  return { error: null, data };
}

export async function signIn(email: string, password: string) {
  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { error, data };
  }

  return { error: null, data };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}
