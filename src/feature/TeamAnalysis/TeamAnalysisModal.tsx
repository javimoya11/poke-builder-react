import { PLACEHOLDER_IMG } from 'components/Pokemon/types.Pokemon';
import { Spinner } from 'components/Spinner/Spinner';
import { Modal } from 'feature/Modal/Modal';
import { useMoveTypeMap, useTypeIconMap } from 'hooks/useTypeIconMap';
import { useState } from 'react';
import { cachedImage, spriteUrl } from 'utils/cachedImage';
import { prettify, prettifyItem } from 'utils/string-utils';
import { abilityAffectedTypes } from './defensiveAbilities';
import styles from './TeamAnalysis.module.css';
import type { ITeamAnalysisModal } from './types.TeamAnalysis';
import type { AnalysedPokemon, CoverageMark, DefenseMark } from './useTeamAnalysis';
import { ALL_TYPES, useTeamAnalysis } from './useTeamAnalysis';

const DEFENSE_LABEL: Record<DefenseMark, string> = {
  weak: 'weak to',
  resist: 'resists',
  neutral: 'takes normal damage from'
};

const COVERAGE_LABEL: Record<CoverageMark, string> = {
  stab: 'hits super-effectively with STAB against',
  move: 'hits super-effectively with a move against',
  none: 'does not hit super-effectively against'
};

/** Explicit mapping: the mark names would otherwise collide with `.move`. */
const COVERAGE_CLASS: Record<CoverageMark, string> = {
  stab: styles.coverStab,
  move: styles.coverMove,
  none: styles.coverNone
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
  /** Moves responsible for the hovered coverage tally, outlined on the card. */
  const [hoveredMoves, setHoveredMoves] = useState<string[]>([]);
  /** Index of the card being hovered, which lights up all of its tallies. */
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

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
   * the only one standing out. On a coverage tally, `moves` names the moves
   * that land the hit, which get outlined on the card. Hovering a card is
   * the reverse: every tally belonging to that Pokémon lights up.
   */
  const tallyProps = (
    id: string,
    index: number,
    mark: string,
    title: string,
    moves: string[] = []
  ) => ({
    title,
    className: [
      styles.tally,
      mark,
      hoveredTally === id || hoveredCard === index
        ? styles.tallyHighlighted
        : ''
    ].join(' '),
    onMouseEnter: () => {
      setHoveredTally(id);
      setHighlighted(index);
      setHoveredMoves(moves);
    },
    onMouseLeave: () => {
      setHoveredTally(null);
      setHighlighted(null);
      setHoveredMoves([]);
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
            outlinedMoves={highlighted === i ? hoveredMoves : []}
            onEdit={() => onEditPokemon(poke.entry)}
            onHoverChange={(hovering) => {
              setHighlighted(hovering ? i : null);
              setHoveredCard(hovering ? i : null);
            }}
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
                {coverage[type].map((mark, i) => (
                  <span
                    key={pokemon[i].entry.id}
                    {...tallyProps(
                      `coverage-${type}-${i}`,
                      i,
                      COVERAGE_CLASS[mark],
                      `${prettify(pokemon[i].entry.pokemon_name)} ${
                        COVERAGE_LABEL[mark]
                      } ${prettifyItem(type)}`,
                      pokemon[i].coveringMoves[type]
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
        <span className={`${styles.legendMark} ${styles.coverStab}`} />{' '}
        super-effective by STAB,{' '}
        <span className={`${styles.legendMark} ${styles.coverMove}`} />{' '}
        super-effective by a move. Defense accounts for abilities that change
        type effectiveness, shown on the card when they do.
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
  outlinedMoves,
  onEdit,
  onHoverChange
}: {
  poke: AnalysedPokemon;
  typeIcons: Record<string, string | null>;
  highlighted: boolean;
  /** Moves to outline, i.e. the ones landing the hovered coverage tally. */
  outlinedMoves: string[];
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
      {poke.relevantAbility && (
        <span
          className={styles.ability}
          title={`${prettifyItem(poke.relevantAbility)} changes how ${abilityAffectedTypes(
            poke.relevantAbility
          )
            .map(prettifyItem)
            .join(' and ')} moves affect this Pokémon`}
        >
          {prettifyItem(poke.relevantAbility)}
        </span>
      )}
      <ul className={styles.moveList}>
        {moves.length ? (
          moves.map((move) => {
            const moveType = moveTypes[move];
            return (
              <li
                key={move}
                className={`${styles.move} ${
                  outlinedMoves.includes(move) ? styles.moveOutlined : ''
                }`}
              >
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
