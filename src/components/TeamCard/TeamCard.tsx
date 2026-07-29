import { useQueryClient } from '@tanstack/react-query';
import { AddToTeam } from 'components/AddToTeam/AddToTeam';
import { PLACEHOLDER_IMG } from 'components/Pokemon/types.Pokemon';
import { Dropdown } from 'feature/Dropdown/Dropdown';
import { ExportImageModal } from 'feature/ExportImage/ExportImageModal';
import { ExportShowdownModal } from 'feature/ExportShowdown/ExportShowdownModal';
import { PokemonSearchModal } from 'feature/PokemonSearchModal/PokemonSearchModal';
import { Award, FileDown, ImageDown, Trash } from 'lucide-react';
import type { Pokemon } from 'pokeapi-js-wrapper';
import { useState } from 'react';
import { cachedImage, spriteUrl } from 'utils/cachedImage';
import { prettify } from 'utils/string-utils';
import { supabase } from '../../lib/supabase';
import type { TeamPokemon } from '../../shared/hooks/useTeams';
import { teamsQueryKey } from '../../shared/hooks/useTeams';
import { useGlobalStore } from '../../shared/stores/useGlobalStore';
import { DeleteItem } from '../DeleteItem/DeleteItem';
import signInStyles from '../SignInButton/SignInButton.module.css';
import styles from './TeamCard.module.css';
import { ITeamCard } from './types.TeamCard';

export const TeamCard = ({ team }: ITeamCard) => {
  const [exportOpen, setExportOpen] = useState(false);
  const [exportShowdownOpen, setExportShowdownOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<TeamPokemon | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [adding, setAdding] = useState<Pokemon | null>(null);
  const user = useGlobalStore((s) => s.user);
  const queryClient = useQueryClient();
  const teamFull = team.team_pokemon.length >= 6;

  const deleteHandler = async () => {
    if (!user) return;
    const { error } = await supabase.from('teams').delete().eq('id', team.id);
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: teamsQueryKey(user.id) });
    setDeleteOpen(false);
  };

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
                title={poke ? prettify(poke.pokemon_name) : 'Add Pokémon'}
                className={styles.slot}
                onClick={
                  poke
                    ? () => setEditing(poke)
                    : () => setSearchOpen(true)
                }
                disabled={!poke && (!user || teamFull)}
              >
                <img
                  className={poke ? undefined : styles.placeholderImg}
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
                label: 'Export Showdown',
                icon: <Award size={16} />,
                callback: () => setExportShowdownOpen(true)
              },
              {
                label: 'Export image',
                icon: <ImageDown size={16} />,
                callback: () => setExportOpen(true)
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

          <button
            className={signInStyles.dropdown}
            onClick={() => setDeleteOpen(true)}
          >
            <Trash size={16} />
          </button>
        </div>
      </div>
      {deleteOpen && (
        <DeleteItem
          open
          onClose={() => setDeleteOpen(false)}
          item={team}
          itemType="team"
          handler={deleteHandler}
          onCancel={() => setDeleteOpen(false)}
        />
      )}
      {editing && (
        <AddToTeam
          open
          onClose={() => setEditing(null)}
          editing={editing}
          teamId={String(team.id)}
        />
      )}
      {searchOpen && (
        <PokemonSearchModal
          open
          onClose={() => setSearchOpen(false)}
          onAccept={(pokemon) => {
            setSearchOpen(false);
            setAdding(pokemon);
          }}
        />
      )}
      {adding && (
        <AddToTeam
          open
          onClose={() => setAdding(null)}
          pokemon={adding}
          teamId={String(team.id)}
          lockTeam
        />
      )}
      {exportOpen && (
        <ExportImageModal
          open
          onClose={() => setExportOpen(false)}
          team={team}
        />
      )}
      {exportShowdownOpen && (
        <ExportShowdownModal
          open
          onClose={() => setExportShowdownOpen(false)}
          team={team}
        />
      )}
    </>
  );
};
