import { Switch } from 'feature/Switch/Switch';
import type { Pokemon } from 'pokeapi-js-wrapper';
import { statColor } from 'utils/statColor';
import { prettifyItem } from 'utils/string-utils';
import styles from './AddToTeam.module.css';
import {
  EV_FIELD,
  IAddToTeamErrors,
  IAddToTeamForm,
  IV_FIELD,
  MAX_IV,
  MAX_SINGLE_EV,
  STAT_NAMES,
  StatName
} from './types.AddToTeam';

interface StatsFieldsetProps {
  form: IAddToTeamForm;
  set: <K extends keyof IAddToTeamForm>(key: K, value: IAddToTeamForm[K]) => void;
  displayPokemon?: Pokemon;
  natureIncreasedStat: StatName | null;
  natureDecreasedStat: StatName | null;
  evInputs: Record<StatName, string>;
  onEvChange: (statName: StatName, raw: string) => void;
  onEvBlur: (statName: StatName) => void;
  errors: IAddToTeamErrors;
  remainingEv: number;
  matchedMegaForm?: string;
  megaViewRequested: boolean;
  setMegaViewRequested: (checked: boolean) => void;
}

/** The "Stats" fieldset: base stats bars, EV/IV inputs, and the Mega-view switch. */
export const StatsFieldset = ({
  form,
  set,
  displayPokemon,
  natureIncreasedStat,
  natureDecreasedStat,
  evInputs,
  onEvChange,
  onEvBlur,
  errors,
  remainingEv,
  matchedMegaForm,
  megaViewRequested,
  setMegaViewRequested
}: StatsFieldsetProps) => (
  <fieldset className={styles.statsFieldset}>
    <legend>Stats</legend>
    {matchedMegaForm && (
      <label htmlFor="mega-view" className={styles.shinyLabel}>
        <Switch
          id="mega-view"
          checked={megaViewRequested}
          onChange={setMegaViewRequested}
        />
        Show Mega stats
      </label>
    )}
    {errors.evTotal && <span className={styles.fieldError}>{errors.evTotal}</span>}
    <div className={styles.statsTable}>
      <span className={styles.statsHeadCell}>Base</span>
      <span className={`${styles.statsHeadCell} ${styles.statsHeadCenter}`}>
        EV
      </span>
      <span className={`${styles.statsHeadCell} ${styles.statsHeadCenter}`}>
        IV
      </span>

      {STAT_NAMES.map((statName) => {
        const evKey = EV_FIELD[statName];
        const ivKey = IV_FIELD[statName];
        const baseStat =
          displayPokemon?.stats.find((s) => s.stat.name === statName)
            ?.base_stat ?? 0;
        const isUp = natureIncreasedStat === statName;
        const isDown = natureDecreasedStat === statName;
        return (
          <div key={statName} className={styles.statRow}>
            <div className={styles.statBase}>
              <span
                className={`${styles.statName} ${isUp ? styles.statUp : isDown ? styles.statDown : ''}`}
              >
                {prettifyItem(statName)}
              </span>
              <span className={styles.baseStat}>{baseStat}</span>
              <span className={styles.statBar} aria-hidden="true">
                <span
                  className={styles.statBarFill}
                  style={{
                    width: `${Math.min(100, (baseStat / 255) * 100)}%`,
                    backgroundColor: statColor(baseStat)
                  }}
                />
              </span>
            </div>
            <input
              aria-label={`${prettifyItem(statName)} EV`}
              type="number"
              min={0}
              max={MAX_SINGLE_EV}
              step={1}
              value={evInputs[statName]}
              onChange={(e) => onEvChange(statName, e.target.value)}
              onBlur={() => onEvBlur(statName)}
              aria-invalid={!!errors[evKey as keyof IAddToTeamErrors]}
            />
            <input
              aria-label={`${prettifyItem(statName)} IV`}
              type="number"
              min={0}
              max={MAX_IV}
              step={1}
              value={form[ivKey] as number}
              onChange={(e) =>
                set(ivKey, Math.min(MAX_IV, Math.max(0, Number(e.target.value))))
              }
              aria-invalid={!!errors[ivKey as keyof IAddToTeamErrors]}
            />
          </div>
        );
      })}
    </div>
    <span className={remainingEv < 0 ? styles.evCounterError : styles.evCounter}>
      {remainingEv} EVs remaining
    </span>
  </fieldset>
);
