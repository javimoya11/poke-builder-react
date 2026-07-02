import { useQueryClient } from '@tanstack/react-query';
import { Modal } from 'feature/Modal/Modal';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { teamsQueryKey } from '../../shared/hooks/useTeams';
import { useGlobalStore } from '../../shared/stores/useGlobalStore';
import styles from './DeleteTeam.module.css';
import { IDeleteTeam } from './types.DeleteTeam';

export const DeleteTeam = ({ open, onClose, team }: IDeleteTeam) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const user = useGlobalStore((s) => s.user);
  const queryClient = useQueryClient();

  const deleteHandler = async () => {
    if (!user) return;
    setLoading(true);
    setFormError(null);
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', team.id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: teamsQueryKey(user.id) });
      onClose();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Could not delete the team.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose}>
      <div className={styles.container}>
        <div className={styles.message}>
          <span>Are you sure you want to delete this team?</span>
          <span className={styles.teamName}>{team.name}</span>
        </div>
        {formError && (
          <div className={`${styles.banner} ${styles.bannerError}`} role="alert">
            {formError}
          </div>
        )}
        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="button" className={styles.confirm} onClick={deleteHandler} disabled={loading}>
            {loading ? (
              <span className="button-spinner" aria-label="Loading" />
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
