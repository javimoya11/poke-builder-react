import { AddToTeam } from 'components/AddToTeam/AddToTeam';
import { PLACEHOLDER_IMG } from 'components/Pokemon/types.Pokemon';
import { Dropdown } from 'feature/Dropdown/Dropdown';
import { Award, FileDown, ImageDown, Trash } from 'lucide-react';
import { useState } from 'react';
import { cachedImage, spriteUrl } from 'utils/cachedImage';
import { prettify } from 'utils/string-utils';
import type { TeamPokemon } from '../../shared/hooks/useTeams';
import { DeleteTeam } from '../DeleteTeam/DeleteTeam';
import signInStyles from '../SignInButton/SignInButton.module.css';
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
                  src={
                    poke
                      ? cachedImage(spriteUrl(poke.pokemon_id, poke.shiny), 96)
                      : PLACEHOLDER_IMG
                  }
                  alt=""
                />
              </button>
            );
          })}
        </div>
        <div className={styles.teamCardFooter}>
          <Dropdown
            actions={[
              {
                label: 'Export Showdown team',
                icon: <Award size={16} />,
                callback: () => {}
              },
              {
                label: 'Export cheatsheet image',
                icon: <ImageDown size={16} />,
                callback: () => {}
              }
            ]}
            trigger={({ toggle }) => (
              <button
                className={signInStyles.dropdown}
                type="button"
                onClick={toggle}
                disabled={team.team_pokemon.length === 0}
              >
                <FileDown size={16} />
              </button>
            )}
          />

          <button onClick={() => setDeleteOpen(true)}>
            <Trash size={16} />
          </button>
        </div>
      </div>
      {deleteOpen && (
        <DeleteTeam open onClose={() => setDeleteOpen(false)} team={team} />
      )}
      {editing && (
        <AddToTeam
          open
          onClose={() => setEditing(null)}
          editing={editing}
          teamId={String(team.id)}
        />
      )}
    </>
  );
};
