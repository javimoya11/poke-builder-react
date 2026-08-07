import { Modal } from 'feature/Modal/Modal';
import { useEffect, useState } from 'react';
import { getPasswordError } from '../AuthForm/validation.AuthForm';
import { updatePassword } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import styles from './ResetPasswordModal.module.css';
import { IResetPasswordErrors } from './types.ResetPasswordModal';

/**
 * Listens for Supabase's `PASSWORD_RECOVERY` event, fired when the user
 * lands back on the app from the reset-password e-mail link, and shows a
 * form to set a new password for the resulting recovery session.
 */
export const ResetPasswordModal = () => {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<IResetPasswordErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setOpen(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const close = () => {
    setOpen(false);
    setPassword('');
    setConfirmPassword('');
    setFieldErrors({});
    setFormError(null);
    setDone(false);
    setLoading(false);
  };

  const submitHandler = async () => {
    setFormError(null);

    const errors: IResetPasswordErrors = {};
    const passwordError = getPasswordError(password);
    if (passwordError) {
      errors.password = passwordError;
    }
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    try {
      const { error } = await updatePassword(password);
      if (error) {
        setFormError(error.message);
        return;
      }
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={close} className={styles.modal}>
      {done ? (
        <div className={styles.doneMessage}>
          <p>Your password has been updated.</p>
          <button type="button" className={styles.submit} onClick={close}>
            Close
          </button>
        </div>
      ) : (
        <form
          className={styles.resetPasswordForm}
          noValidate
          onSubmit={async (e) => {
            e.preventDefault();
            await submitHandler();
          }}
        >
          <label htmlFor="new-password">
            New password
            <input
              type="password"
              name="new-password"
              id="new-password"
              autoComplete="new-password"
              value={password}
              aria-invalid={!!fieldErrors.password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {fieldErrors.password && (
              <span className={styles.fieldError}>
                {fieldErrors.password}
              </span>
            )}
          </label>

          <label htmlFor="new-password-confirm">
            Confirm new password
            <input
              type="password"
              name="new-password-confirm"
              id="new-password-confirm"
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

          {formError && (
            <div
              className={`${styles.banner} ${styles.bannerError}`}
              role="alert"
            >
              {formError}
            </div>
          )}

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? (
              <span className="button-spinner" aria-label="Loading" />
            ) : (
              'Update password'
            )}
          </button>
        </form>
      )}
    </Modal>
  );
};
