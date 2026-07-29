import { Modal } from 'feature/Modal/Modal';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useGlobalStore } from '../../shared/stores/useGlobalStore';
import styles from './ChangeProfileNameModal.module.css';
import { IChangeProfileNameModal } from './types.ChangeProfileNameModal';

const MAX_NAME = 50;

export const ChangeProfileNameModal = ({
  open,
  onClose
}: IChangeProfileNameModal) => {
  const user = useGlobalStore((s) => s.user);
  const setUser = useGlobalStore((s) => s.setUser);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(user?.user_metadata.display_name ?? '');
    setLoading(false);
    setFormError(null);
  }, [open, user]);

  const submitHandler = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setLoading(true);
    setFormError(null);
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { display_name: trimmedName }
      });
      if (error) throw error;
      if (data.user) setUser(data.user);
      onClose();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Could not update the name.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} className={styles.modal}>
      <form
        className={styles.form}
        onSubmit={async (e) => {
          e.preventDefault();
          await submitHandler();
        }}
      >
        <label htmlFor="profile-name">
          Profile name
          <input
            type="text"
            name="profile-name"
            id="profile-name"
            maxLength={MAX_NAME}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        {formError && (
          <div className={`${styles.banner} ${styles.bannerError}`} role="alert">
            {formError}
          </div>
        )}
        <button
          type="submit"
          className={styles.submit}
          disabled={!name.trim() || loading}
        >
          {loading ? (
            <span className="button-spinner" aria-label="Loading" />
          ) : (
            'Save'
          )}
        </button>
      </form>
    </Modal>
  );
};
