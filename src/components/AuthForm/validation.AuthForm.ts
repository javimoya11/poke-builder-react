import { IAuthSchema } from './types.AuthForm';

export interface IAuthErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 6;

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

  if (!values.password) {
    errors.password = 'Password is required.';
  } else if (values.password.length < MIN_PASSWORD) {
    errors.password = `Password must be at least ${MIN_PASSWORD} characters.`;
  }

  if (mode === 'signUp') {
    if (!values.passwordRepeat) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (values.password !== values.passwordRepeat) {
      errors.confirmPassword = 'Passwords do not match.';
    }
  }

  return errors;
};
