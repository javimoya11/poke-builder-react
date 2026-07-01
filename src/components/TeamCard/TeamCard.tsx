import { AddToTeam } from 'components/AddToTeam/AddToTeam';
import { PLACEHOLDER_IMG } from 'components/Pokemon/types.Pokemon';
import { cachedImage, spriteUrl } from 'utils/cachedImage';
import { prettify } from 'utils/string-utils';
import { Trash } from 'lucide-react';
import { useState } from 'react';
import type { TeamPokemon } from '../../shared/hooks/useTeams';
import { DeleteTeam } from '../DeleteTeam/DeleteTeam';
import styles from './TeamCard.module.css';
import { ITeamCard } from './types.TeamCard';

export const TeamCard = ({ team }: ITeamCard) => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<TeamPokemon | null>(null);

  return (
    <>
      <div className={styles.teamCard}>
        <div className={styles.teamCardTitle}>
          <span title={team.name}>{team.name}</span>
          <button onClick={() => setDeleteOpen(true)}>
            <Trash size={16} />
          </button>
        </div>
        <div className={styles.teamCardContent}>
          {Array.from({ length: 6 }, (_, i) => {
            const poke = team.team_pokemon[i];
            return (
              <button
                key={i}
                type="button"
                title={poke ? prettify(poke.pokemon_name) : 'Empty'}
                className={styles.slot}
                onClick={poke ? () => setEditing(poke) : undefined}
                disabled={!poke}
              >
                <img
                  src={poke ? cachedImage(spriteUrl(poke.pokemon_id, poke.shiny), 96) : PLACEHOLDER_IMG}
                  alt=""
                />
              </button>
            );
          })}
        </div>
      </div>
      <DeleteTeam
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        team={team}
      />
      <AddToTeam
        open={!!editing}
        onClose={() => setEditing(null)}
        editing={editing ?? undefined}
        teamId={String(team.id)}
      />
    </>
  );
};
