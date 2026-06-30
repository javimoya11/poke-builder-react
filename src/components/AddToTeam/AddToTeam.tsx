import { Modal } from 'feature/Modal/Modal';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useHeldItems } from '../../shared/hooks/useHeldItems';
import { useItem } from '../../shared/hooks/useItem';
import { useTeams } from '../../shared/hooks/useTeams';
import { useGlobalStore } from '../../shared/stores/useGlobalStore';
import styles from './AddToTeam.module.css';
import { prettifyItem } from 'utils/string-utils';
import { getForcedItem, IAddToTeam, isUnmappedMega } from './types.AddToTeam';

export const AddToTeam = ({ open, onClose, pokemon }: IAddToTeam) => {
  const forcedItem = useMemo(() => getForcedItem(pokemon?.name), [pokemon?.name]);
  const itemBlocked = useMemo(() => !!forcedItem || isUnmappedMega(pokemon?.name), [forcedItem, pokemon?.name]);

  const [loading, setLoading] = useState<boolean>(false);
  const [teamId, setTeamId] = useState<string>('');
  const [itemId, setItemId] = useState<string>('');

  const user = useGlobalStore((s) => s.user);
  const { data: teams = [] } = useTeams(user?.id);
  const { data: heldItems = [], isLoading: heldItemsLoading } = useHeldItems({ enabled: !itemBlocked });
  const { data: forcedItemData, isLoading: forcedItemLoading } = useItem(forcedItem);

  const isItemLoading = itemBlocked ? forcedItemLoading : heldItemsLoading;

  useEffect(() => {
    if (!open) return;
    setLoading(false);
    setTeamId('');
    setItemId(forcedItem ?? '');
  }, [open, forcedItem]);

  const submitHandler = async () => {
    if (!pokemon || !user || !teamId) return;
    setLoading(true);
    const { error } = await supabase
      .from('team_pokemon')
      .insert({ ...pokemon, team_id: teamId, item: itemId || null });
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
        <label htmlFor="item">
          Held item
          <select
            name="item"
            id="item"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            disabled={itemBlocked || isItemLoading}
          >
            <option value="">
              {isItemLoading ? 'Loading...' : 'None'}
            </option>
            {itemBlocked && forcedItemData ? (
              <option value={forcedItemData.name}>{prettifyItem(forcedItemData.name)}</option>
            ) : (
              heldItems.map((item) => (
                <option key={item.name} value={item.name}>
                  {prettifyItem(item.name)}
                </option>
              ))
            )}
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
