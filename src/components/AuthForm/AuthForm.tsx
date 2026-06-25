import { Modal } from 'feature/Modal/Modal';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, signUp } from '../../lib/auth';
import styles from './AuthForm.module.css';
import { IAuthForm } from './types.AuthForm';
import { IAuthErrors, validateAuth } from './validation.AuthForm';

type Mode = 'signIn' | 'signUp';

export const AuthForm = ({ isOpen, onClose }: IAuthForm) => {
  const [mode, setMode] = useState<Mode>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [fieldErrors, setFieldErrors] = useState<IAuthErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Reset to a clean state every time the modal opens.
  useEffect(() => {
    if (!isOpen) return;
    setMode('signIn');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setFieldErrors({});
    setFormError(null);
    setInfo(null);
    setLoading(false);
  }, [isOpen]);

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    setFieldErrors({});
    setFormError(null);
    setInfo(null);
    setConfirmPassword('');
    setDisplayName('');
  };

  const submitHandler = async () => {
    setFormError(null);
    setInfo(null);

    const errors = validateAuth(
      { email, password, passwordRepeat: confirmPassword, displayName },
      mode
    );
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      if (mode === 'signUp') {
        const { error, data } = await signUp(
          email.trim(),
          password,
          displayName.trim()
        );
        if (error) {
          setFormError(error.message);
          return;
        }
        // If email confirmation is enabled there is no session yet: the user
        // must confirm before logging in.
        if (!data.session) {
          setInfo(
            'Account created. Check your email to confirm your account before logging in.'
          );
          return;
        }
        // Session active: the auth listener updates the store, just close.
        onClose();
      } else {
        const { error } = await signIn(email.trim(), password);
        if (error) {
          setFormError(error.message);
          return;
        }
        onClose();
        navigate('/profile');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form
        className={styles.authForm}
        noValidate
        onSubmit={async (e) => {
          e.preventDefault();
          await submitHandler();
        }}
      >
        <nav>
          <button
            type="button"
            className={mode === 'signIn' ? styles.active : ''}
            onClick={() => switchMode('signIn')}
          >
            Log In
          </button>
          <button
            type="button"
            className={mode === 'signUp' ? styles.active : ''}
            onClick={() => switchMode('signUp')}
          >
            Sign Up
          </button>
        </nav>

        {mode === 'signUp' && (
          <label htmlFor="display-name">
            Nickname
            <input
              type="text"
              name="display-name"
              id="display-name"
              autoComplete="username"
              value={displayName}
              aria-invalid={!!fieldErrors.displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            {fieldErrors.displayName && (
              <span className={styles.fieldError}>
                {fieldErrors.displayName}
              </span>
            )}
          </label>
        )}

        <label htmlFor="email">
          Email
          <input
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            value={email}
            aria-invalid={!!fieldErrors.email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {fieldErrors.email && (
            <span className={styles.fieldError}>{fieldErrors.email}</span>
          )}
        </label>

        <label htmlFor="pass">
          Password
          <input
            type="password"
            name="pass"
            id="pass"
            autoComplete={
              mode === 'signUp' ? 'new-password' : 'current-password'
            }
            value={password}
            aria-invalid={!!fieldErrors.password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {fieldErrors.password && (
            <span className={styles.fieldError}>{fieldErrors.password}</span>
          )}
        </label>

        {mode === 'signUp' && (
          <label htmlFor="pass-confirm">
            Confirm Password
            <input
              type="password"
              name="pass-confirm"
              id="pass-confirm"
              autoComplete="new-password"
              value={confirmPassword}
              aria-invalid={!!fieldErrors.confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {fieldErrors.confirmPassword && (
              <span className={styles.fieldError}>
                {fieldErrors.confirmPassword}
              </span>
            )}
          </label>
        )}

        {formError && (
          <div
            className={`${styles.banner} ${styles.bannerError}`}
            role="alert"
          >
            {formError}
          </div>
        )}
        {info && (
          <div
            className={`${styles.banner} ${styles.bannerInfo}`}
            role="status"
          >
            {info}
          </div>
        )}

        <button type="submit" className={styles.submit} disabled={loading}>
          {loading ? (
            <span className="button-spinner" aria-label="Loading" />
          ) : mode === 'signUp' ? (
            'Create account'
          ) : (
            'Log in'
          )}
        </button>
      </form>
    </Modal>
  );
};
