import { IAuthSchema } from './types.AuthForm';

export interface IAuthErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  displayName?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD = 10;
const HAS_LOWERCASE_RE = /[a-z]/;
const HAS_UPPERCASE_RE = /[A-Z]/;
const HAS_NUMBER_RE = /\d/;

/**
 * Mirrors the password policy enforced server-side in Supabase (min
 * length + lowercase + uppercase + number). Returns `null` when valid.
 */
export const getPasswordError = (password: string): string | null => {
  if (!password) {
    return 'Password is required.';
  }
  if (
    password.length < MIN_PASSWORD ||
    !HAS_LOWERCASE_RE.test(password) ||
    !HAS_UPPERCASE_RE.test(password) ||
    !HAS_NUMBER_RE.test(password)
  ) {
    return `Password must be at least ${MIN_PASSWORD} characters and include lowercase, uppercase, and a number.`;
  }
  return null;
};

/**
 * Client-side validation. Returns one English message per invalid field;
 * an empty object means the form is valid.
 */
export const validateAuth = (
  values: IAuthSchema,
  mode: 'signUp' | 'signIn'
): IAuthErrors => {
  const errors: IAuthErrors = {};

  const email = values.email.trim();
  if (!email) {
    errors.email = 'Email is required.';
  } else if (!EMAIL_RE.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  const passwordError = getPasswordError(values.password);
  if (passwordError) {
    errors.password = passwordError;
  }

  if (mode === 'signUp') {
    if (!values.displayName?.trim()) {
      errors.displayName = 'Display name is required.';
    }

    if (!values.passwordRepeat) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (values.password !== values.passwordRepeat) {
      errors.confirmPassword = 'Passwords do not match.';
    }
  }

  return errors;
};
