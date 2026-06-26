import { useQueryClient } from '@tanstack/react-query';
import { Modal } from 'feature/Modal/Modal';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useGlobalStore } from '../../shared/stores/useGlobalStore';
import { teamsQueryKey } from '../../shared/hooks/useTeams';
import styles from './NewTeam.module.css';
import { INewTeam } from './types.NewTeam';

export const NewTeam = ({ open, onClose }: INewTeam) => {
  const [name, setName] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const user = useGlobalStore((s) => s.user);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) return;
    setName('');
    setLoading(false);
  }, [open]);

  const submitHandler = async () => {
    if (!name || !user) return;
    setLoading(true);
    const { error } = await supabase
      .from('teams')
      .insert({ name, user_id: user.id });
    setLoading(false);
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: teamsQueryKey(user.id) });
    onClose();
  };
  return (
    <Modal isOpen={open} onClose={onClose}>
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
            type="input"
            name="team-name"
            id="team-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <button
          type="submit"
          className={styles.submit}
          disabled={!name || loading}
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
