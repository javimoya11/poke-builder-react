import { supabase } from './supabase';

/**
 * Creates a new Supabase account and sends a confirmation e-mail.
 * @param email - User's e-mail address.
 * @param password - Chosen password.
 * @param displayName - Public display name stored in user metadata.
 * @returns `{ error, data }` from Supabase; `error` is `null` on success.
 */
export async function signUp(
  email: string,
  password: string,
  displayName: string
) {
  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin,
      data: { display_name: displayName }
    }
  });

  if (error) {
    return { error, data };
  }

  return { error: null, data };
}

/**
 * Signs in an existing user with e-mail and password.
 * @param email - User's e-mail address.
 * @param password - Account password.
 * @returns `{ error, data }` from Supabase; `error` is `null` on success.
 */
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

/**
 * Signs out the currently authenticated user from all devices.
 * @returns `{ error }` from Supabase; `error` is `null` on success.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}
