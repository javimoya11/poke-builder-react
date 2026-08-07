import type { AvailableMove } from 'hooks/useAvailableMoves';
import { damageClassAbbr, prettifyItem } from 'utils/string-utils';
import type { TypeIconMap } from 'types';
import styles from './AddToTeam.module.css';
import { IAddToTeamErrors, IAddToTeamForm, MOVE_SLOTS } from './types.AddToTeam';

interface MovesFieldsetProps {
  form: IAddToTeamForm;
  set: <K extends keyof IAddToTeamForm>(key: K, value: IAddToTeamForm[K]) => void;
  moves: AvailableMove[];
  typeIconMap: TypeIconMap;
  errors: IAddToTeamErrors;
  usedMoves: (slot: (typeof MOVE_SLOTS)[number]) => string[];
}

/** The "Moves" fieldset: four move slots with type/power/damage-class hints. */
export const MovesFieldset = ({
  form,
  set,
  moves,
  typeIconMap,
  errors,
  usedMoves
}: MovesFieldsetProps) => (
  <fieldset className={styles.movesFieldset}>
    <legend>Moves</legend>
    <div className={`${styles.movesGrid} ${styles.movesGridFull}`}>
      {MOVE_SLOTS.map((slot, i) => {
        const selectedMove = moves.find((m) => m.name === form[slot]);
        const moveTypeIcon = selectedMove?.type
          ? typeIconMap[selectedMove.type]
          : null;
        const moveDamageClass = damageClassAbbr(
          selectedMove?.damageClass ?? null
        );
        return (
          <label key={slot} htmlFor={slot}>
            <span className={styles.labelWithIcon}>
              Move {i + 1}
              {(moveTypeIcon ||
                selectedMove?.power != null ||
                moveDamageClass) && (
                <span className={styles.moveTypeInfo}>
                  {moveTypeIcon && (
                    <img src={moveTypeIcon} alt={selectedMove!.type as string} />
                  )}
                  <span className={styles.moveMeta}>
                    {selectedMove?.power != null && (
                      <span className={styles.movePower}>
                        Pow: {selectedMove.power}
                      </span>
                    )}
                    {moveDamageClass && (
                      <span className={styles.moveDamageClass}>
                        {moveDamageClass}
                      </span>
                    )}
                  </span>
                </span>
              )}
            </span>
            <select
              id={slot}
              value={form[slot]}
              onChange={(e) => set(slot, e.target.value)}
              aria-invalid={i === 0 && !!errors.moves}
            >
              <option value="">None</option>
              {moves
                .filter((m) => !usedMoves(slot).includes(m.name))
                .sort((a, b) =>
                  prettifyItem(a.name).localeCompare(prettifyItem(b.name))
                )
                .map((m) => (
                  <option key={m.name} value={m.name}>
                    {prettifyItem(m.name)}
                  </option>
                ))}
            </select>
          </label>
        );
      })}
    </div>
    {errors.moves && <span className={styles.fieldError}>{errors.moves}</span>}
  </fieldset>
);
