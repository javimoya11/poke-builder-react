import { PLACEHOLDER_IMG } from 'components/Pokemon/types.Pokemon';
import { Spinner } from 'components/Spinner/Spinner';
import { Modal } from 'feature/Modal/Modal';
import { useMoveTypeMap, useTypeIconMap } from 'hooks/useTypeIconMap';
import { useState } from 'react';
import { cachedImage, spriteUrl } from 'utils/cachedImage';
import { prettify, prettifyItem } from 'utils/string-utils';
import styles from './TeamAnalysis.module.css';
import type { ITeamAnalysisModal } from './types.TeamAnalysis';
import type { AnalysedPokemon, DefenseMark } from './useTeamAnalysis';
import { ALL_TYPES, useTeamAnalysis } from './useTeamAnalysis';

const DEFENSE_LABEL: Record<DefenseMark, string> = {
  weak: 'weak to',
  resist: 'resists',
  neutral: 'takes normal damage from'
};

export const TeamAnalysisModal = ({
  open,
  onClose,
  team,
  onEditPokemon,
  onAddPokemon
}: ITeamAnalysisModal) => (
  <Modal isOpen={open} onClose={onClose} className={styles.modal}>
    <TeamAnalysisContent
      team={team}
      onEditPokemon={onEditPokemon}
      onAddPokemon={onAddPokemon}
    />
  </Modal>
);

const TeamAnalysisContent = ({
  team,
  onEditPokemon,
  onAddPokemon
}: Pick<ITeamAnalysisModal, 'team' | 'onEditPokemon' | 'onAddPokemon'>) => {
  const { pokemon, defense, coverage, isLoading } = useTeamAnalysis(
    team.team_pokemon
  );
  const { data: typeIcons = {} } = useTypeIconMap();
  /** Index of the team member currently hovered, in either a tally or a card. */
  const [highlighted, setHighlighted] = useState<number | null>(null);
  /** Id of the single tally under the cursor, so only that one lights up. */
  const [hoveredTally, setHoveredTally] = useState<string | null>(null);

  if (isLoading) return <Spinner />;

  if (!pokemon.length) {
    return (
      <div className={styles.content}>
        <h2 className={styles.title}>{team.name}</h2>
        <p className={styles.empty}>
          Add Pokémon to this team to see its type analysis.
        </p>
        {onAddPokemon && (
          <div className={styles.pokemonRow}>
            <AddPokemonCard onAdd={onAddPokemon} />
          </div>
        )}
      </div>
    );
  }

  const typeLabel = (type: string) => (
    <span className={styles.typeLabel}>
      {typeIcons[type] ? (
        <img src={typeIcons[type]!} alt={prettifyItem(type)} />
      ) : (
        prettifyItem(type)
      )}
    </span>
  );

  /**
   * Hovering a tally highlights that exact tally plus its Pokémon's card —
   * but not the same Pokémon's other tallies, so the mark being read stays
   * the only one standing out.
   */
  const tallyProps = (id: string, index: number, mark: string, title: string) => ({
    title,
    className: [
      styles.tally,
      mark,
      hoveredTally === id ? styles.tallyHighlighted : ''
    ].join(' '),
    onMouseEnter: () => {
      setHoveredTally(id);
      setHighlighted(index);
    },
    onMouseLeave: () => {
      setHoveredTally(null);
      setHighlighted(null);
    }
  });

  return (
    <div className={styles.content}>
      <h2 className={styles.title}>{team.name}</h2>

      <div className={styles.pokemonRow}>
        {pokemon.map((poke, i) => (
          <PokemonCard
            key={poke.entry.id}
            poke={poke}
            typeIcons={typeIcons}
            highlighted={highlighted === i}
            onEdit={() => onEditPokemon(poke.entry)}
            onHoverChange={(hovering) => setHighlighted(hovering ? i : null)}
          />
        ))}
        {onAddPokemon && <AddPokemonCard onAdd={onAddPokemon} />}
      </div>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Team Defense</h3>
        <div className={styles.typeGrid}>
          {ALL_TYPES.map((type) => (
            <div key={type} className={styles.typeRow}>
              {typeLabel(type)}
              <div className={styles.tallies}>
                {defense[type].map((mark, i) => (
                  <span
                    key={pokemon[i].entry.id}
                    {...tallyProps(
                      `defense-${type}-${i}`,
                      i,
                      styles[mark],
                      `${prettify(pokemon[i].entry.pokemon_name)} ${
                        DEFENSE_LABEL[mark]
                      } ${prettifyItem(type)}`
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Coverage</h3>
        <div className={styles.typeGrid}>
          {ALL_TYPES.map((type) => (
            <div key={type} className={styles.typeRow}>
              {typeLabel(type)}
              <div className={styles.tallies}>
                {coverage[type].map((covers, i) => (
                  <span
                    key={pokemon[i].entry.id}
                    {...tallyProps(
                      `coverage-${type}-${i}`,
                      i,
                      covers ? styles.covers : styles.neutral,
                      `${prettify(pokemon[i].entry.pokemon_name)} ${
                        covers ? 'hits' : 'does not hit'
                      } ${prettifyItem(type)} super-effectively`
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className={styles.legend}>
        Defense: <span className={`${styles.legendMark} ${styles.weak}`} /> weak,{' '}
        <span className={`${styles.legendMark} ${styles.resist}`} /> resists or
        immune, <span className={`${styles.legendMark} ${styles.neutral}`} /> normal
        damage. Coverage:{' '}
        <span className={`${styles.legendMark} ${styles.covers}`} /> hits
        super-effectively (moves or STAB).
      </p>
    </div>
  );
};

const AddPokemonCard = ({ onAdd }: { onAdd: () => void }) => (
  <button
    type="button"
    className={`${styles.pokemonCard} ${styles.addCard}`}
    onClick={onAdd}
    title="Add Pokémon"
  >
    <img className={styles.pokemonSprite} src={PLACEHOLDER_IMG} alt="" />
    <span className={styles.pokemonName}>Add Pokémon</span>
  </button>
);

const PokemonCard = ({
  poke,
  typeIcons,
  highlighted,
  onEdit,
  onHoverChange
}: {
  poke: AnalysedPokemon;
  typeIcons: Record<string, string | null>;
  highlighted: boolean;
  onEdit: () => void;
  onHoverChange: (hovering: boolean) => void;
}) => {
  const { data: moveTypes = {} } = useMoveTypeMap();
  const moves = [
    poke.entry.move_1,
    poke.entry.move_2,
    poke.entry.move_3,
    poke.entry.move_4
  ].filter((move): move is string => !!move);

  return (
    <button
      type="button"
      className={`${styles.pokemonCard} ${
        highlighted ? styles.pokemonCardHighlighted : ''
      }`}
      onClick={onEdit}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      title={`Edit ${prettify(poke.entry.pokemon_name)}`}
    >
      <img
        className={styles.pokemonSprite}
        src={cachedImage(spriteUrl(poke.entry.pokemon_id, poke.entry.shiny), 96)}
        alt=""
      />
      <span className={styles.pokemonName}>
        {poke.entry.nickname || prettify(poke.entry.pokemon_name)}
      </span>
      <span className={styles.pokemonTypes}>
        {poke.types.map((type) =>
          typeIcons[type] ? (
            <img key={type} src={typeIcons[type]!} alt={prettifyItem(type)} />
          ) : (
            <span key={type}>{prettifyItem(type)}</span>
          )
        )}
      </span>
      <ul className={styles.moveList}>
        {moves.length ? (
          moves.map((move) => {
            const moveType = moveTypes[move];
            return (
              <li key={move} className={styles.move}>
                {moveType && typeIcons[moveType] && (
                  <img src={typeIcons[moveType]!} alt={prettifyItem(moveType)} />
                )}
                <span>{prettifyItem(move)}</span>
              </li>
            );
          })
        ) : (
          <li className={styles.noMoves}>No moves</li>
        )}
      </ul>
    </button>
  );
};
