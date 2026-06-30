import { Modal } from 'feature/Modal/Modal';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useTeams } from '../../shared/hooks/useTeams';
import { useGlobalStore } from '../../shared/stores/useGlobalStore';
import styles from './AddToTeam.module.css';
import { IAddToTeam } from './types.AddToTeam';

export const AddToTeam = ({ open, onClose, pokemon }: IAddToTeam) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [teamId, setTeamId] = useState<string>('');
  const user = useGlobalStore((s) => s.user);
  const { data: teams = [] } = useTeams(user?.id);

  useEffect(() => {
    if (!open) return;
    setLoading(false);
    setTeamId('');
  }, [open]);

  const submitHandler = async () => {
    if (!pokemon || !user || !teamId) return;
    setLoading(true);
    const { error } = await supabase
      .from('team_pokemon')
      .insert({ ...pokemon, team_id: teamId });
    setLoading(false);
    if (error) throw error;
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={onClose}>
      <form
        className={styles.addToTeamForm}
        onSubmit={async (e) => {
          e.preventDefault();
          await submitHandler();
        }}
      >
        <label htmlFor="team-name">
          Team
          <select
            name="team-name"
            id="team-name"
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
          >
            <option value="" disabled hidden>
              Select an option...
            </option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className={styles.submit}
          disabled={loading || !teamId}
        >
          {loading ? (
            <span className="button-spinner" aria-label="Loading" />
          ) : (
            'Add to team'
          )}
        </button>
      </form>
    </Modal>
  );
};
