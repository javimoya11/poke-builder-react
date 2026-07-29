import { Modal } from 'feature/Modal/Modal';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import styles from './DeleteAccountModal.module.css';
import { IDeleteAccountModal } from './types.DeleteAccountModal';

const CONFIRM_WORD = 'Delete';

export const DeleteAccountModal = ({
  open,
  onClose
}: IDeleteAccountModal) => {
  const navigate = useNavigate();
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setConfirmText('');
    setLoading(false);
    setFormError(null);
  }, [open]);

  const confirmHandler = async () => {
    setLoading(true);
    setFormError(null);
    try {
      const { error } = await supabase.functions.invoke('delete-account');
      if (error) throw error;
      onClose();
      await supabase.auth.signOut();
      navigate('/');
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Could not delete the account.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} className={styles.modal}>
      <div className={styles.container}>
        <div className={styles.message}>
          <span>
            This will permanently delete your account, including every team
            and Pokémon you have saved. This cannot be undone.
          </span>
          <label htmlFor="delete-account-confirm">
            Type <strong>{CONFIRM_WORD}</strong> to confirm
            <input
              type="text"
              id="delete-account-confirm"
              autoComplete="off"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </label>
        </div>
        {formError && (
          <div className={`${styles.banner} ${styles.bannerError}`} role="alert">
            {formError}
          </div>
        )}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancel}
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.confirm}
            onClick={confirmHandler}
            disabled={loading || confirmText !== CONFIRM_WORD}
          >
            {loading ? (
              <span className="button-spinner" aria-label="Loading" />
            ) : (
              'Delete account'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
