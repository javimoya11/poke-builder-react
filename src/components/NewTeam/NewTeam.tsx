import { useQueryClient } from '@tanstack/react-query';
import { Modal } from 'feature/Modal/Modal';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useGlobalStore } from '../../shared/stores/useGlobalStore';
import { teamsQueryKey } from '../../shared/hooks/useTeams';
import styles from './NewTeam.module.css';
import { INewTeam } from './types.NewTeam';

const MAX_TEAM_NAME = 50;

export const NewTeam = ({ open, onClose }: INewTeam) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const user = useGlobalStore((s) => s.user);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) return;
    setName('');
    setLoading(false);
    setFormError(null);
  }, [open]);

  const submitHandler = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || !user) return;
    setLoading(true);
    setFormError(null);
    try {
      const { error } = await supabase
        .from('teams')
        .insert({ name: trimmedName, user_id: user.id });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: teamsQueryKey(user.id) });
      onClose();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Could not create the team.'
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal isOpen={open} onClose={onClose} className={styles.modal}>
      <form
        className={styles.newTeamForm}
        onSubmit={async (e) => {
          e.preventDefault();
          await submitHandler();
        }}
      >
        <label htmlFor="team-name">
          Team name
          <input
            type="text"
            name="team-name"
            id="team-name"
            maxLength={MAX_TEAM_NAME}
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
            'Add team'
          )}
        </button>
      </form>
    </Modal>
  );
};
