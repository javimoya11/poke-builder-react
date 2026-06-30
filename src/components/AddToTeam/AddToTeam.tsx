import { Modal } from 'feature/Modal/Modal';
import { useEffect, useMemo, useState } from 'react';
import { prettifyItem } from 'utils/string-utils';
import { supabase } from '../../lib/supabase';
import { useAvailableMoves } from '../../shared/hooks/useAvailableMoves';
import { useHeldItems } from '../../shared/hooks/useHeldItems';
import { useItem } from '../../shared/hooks/useItem';
import { useTeams } from '../../shared/hooks/useTeams';
import { useGlobalStore } from '../../shared/stores/useGlobalStore';
import styles from './AddToTeam.module.css';
import {
  EV_FIELD,
  getForcedItem,
  IAddToTeam,
  IAddToTeamErrors,
  IAddToTeamForm,
  INITIAL_FORM,
  isUnmappedMega,
  MAX_TOTAL_EV,
  MOVE_SLOTS,
  STAT_NAMES,
} from './types.AddToTeam';
import { validateAddToTeam } from './validation.AddToTeam';

export const AddToTeam = ({ open, onClose, pokemon }: IAddToTeam) => {
  const forcedItem  = useMemo(() => getForcedItem(pokemon?.name), [pokemon?.name]);
  const itemBlocked = useMemo(
    () => !!forcedItem || isUnmappedMega(pokemon?.name),
    [forcedItem, pokemon?.name]
  );

  const [form, setForm]     = useState<IAddToTeamForm>({ ...INITIAL_FORM, held_item: forcedItem ?? '' });
  const [errors, setErrors] = useState<IAddToTeamErrors>({});
  const [loading, setLoading] = useState(false);

  const user = useGlobalStore((s) => s.user);
  const { data: teams = [] } = useTeams(user?.id);
  const { data: heldItems = [], isLoading: heldItemsLoading } = useHeldItems({ enabled: !itemBlocked });
  const { data: forcedItemData, isLoading: forcedItemLoading }  = useItem(forcedItem);
  const moves = useAvailableMoves(pokemon);

  const isItemLoading = itemBlocked ? forcedItemLoading : heldItemsLoading;

  const selectedTeam = teams.find((t) => t.id === form.teamId);
  const usedSlots    = selectedTeam?.team_pokemon?.map((p) => p.slot) ?? [];
  const nextSlot     = usedSlots.length > 0 ? Math.max(...usedSlots) + 1 : 1;
  const teamFull     = usedSlots.length >= 6;

  const totalEv = form.ev_hp + form.ev_atk + form.ev_def + form.ev_spatk + form.ev_spdef + form.ev_spd;
  const remainingEv = MAX_TOTAL_EV - totalEv;

  useEffect(() => {
    if (!open) return;
    setForm({ ...INITIAL_FORM, held_item: forcedItem ?? '' });
    setErrors({});
    setLoading(false);
  }, [open, forcedItem]);

  const set = <K extends keyof IAddToTeamForm>(key: K, value: IAddToTeamForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const usedMoves = (slot: typeof MOVE_SLOTS[number]) =>
    MOVE_SLOTS.filter((s) => s !== slot)
      .map((s) => form[s])
      .filter(Boolean);

  const submitHandler = async () => {
    const errs = validateAddToTeam(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    if (!pokemon || !user) return;
    setLoading(true);
    const { error } = await supabase.from('team_pokemon').insert({
      team_id:      form.teamId,
      slot:         nextSlot,
      pokemon_name: pokemon.name,
      pokemon_id:   pokemon.id,
      held_item:    form.held_item || null,
      ev_hp:        form.ev_hp,
      ev_atk:       form.ev_atk,
      ev_def:       form.ev_def,
      ev_spatk:     form.ev_spatk,
      ev_spdef:     form.ev_spdef,
      ev_spd:       form.ev_spd,
      move_1:       form.move_1 || null,
      move_2:       form.move_2 || null,
      move_3:       form.move_3 || null,
      move_4:       form.move_4 || null,
      ability:      form.ability,
    });
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
        <div className={styles.formInputs}>

          {/* Row 1: Team + Held item */}
          <div className={styles.row}>
            <label htmlFor="team-name">
              Team
              <select
                id="team-name"
                value={form.teamId}
                onChange={(e) => set('teamId', e.target.value)}
                aria-invalid={!!errors.teamId}
              >
                <option value="" disabled hidden>Select a team...</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id} disabled={(t.team_pokemon?.length ?? 0) >= 6}>
                    {t.name}
                  </option>
                ))}
              </select>
              {errors.teamId && <span className={styles.fieldError}>{errors.teamId}</span>}
              {teamFull && <span className={styles.fieldError}>This team is full (6/6).</span>}
            </label>

            <label htmlFor="item">
              Held item
              <select
                id="item"
                value={form.held_item}
                onChange={(e) => set('held_item', e.target.value)}
                disabled={itemBlocked || isItemLoading}
              >
                <option value="">{isItemLoading ? 'Loading...' : 'None'}</option>
                {itemBlocked && forcedItemData ? (
                  <option value={forcedItemData.name}>{prettifyItem(forcedItemData.name)}</option>
                ) : (
                  heldItems.map((item) => (
                    <option key={item.name} value={item.name}>{prettifyItem(item.name)}</option>
                  ))
                )}
              </select>
            </label>
          </div>

          {/* Row 2: Ability full width */}
          <label htmlFor="ability">
            Ability
            <select
              id="ability"
              value={form.ability}
              onChange={(e) => set('ability', e.target.value)}
              aria-invalid={!!errors.ability}
            >
              <option value="" disabled hidden>Select an ability...</option>
              {pokemon?.abilities.map(({ ability }) => (
                <option key={ability.name} value={ability.name}>
                  {prettifyItem(ability.name)}
                </option>
              ))}
            </select>
            {errors.ability && <span className={styles.fieldError}>{errors.ability}</span>}
          </label>

          {/* Moves: 2×2 grid */}
          <fieldset className={styles.movesFieldset}>
            <legend>Moves</legend>
            <div className={styles.movesGrid}>
              {MOVE_SLOTS.map((slot, i) => (
                <label key={slot} htmlFor={slot}>
                  Move {i + 1}{i === 0 ? ' *' : ''}
                  <select
                    id={slot}
                    value={form[slot]}
                    onChange={(e) => set(slot, e.target.value)}
                    aria-invalid={i === 0 && !!errors.moves}
                  >
                    <option value="">None</option>
                    {moves
                      .filter((m) => !usedMoves(slot).includes(m.name))
                      .map((m) => (
                        <option key={m.name} value={m.name}>{prettifyItem(m.name)}</option>
                      ))}
                  </select>
                </label>
              ))}
            </div>
            {errors.moves && <span className={styles.fieldError}>{errors.moves}</span>}
          </fieldset>

          {/* EVs: 2×3 grid */}
          <fieldset className={styles.evsFieldset}>
            <legend>
              EVs
              <span className={remainingEv < 0 ? styles.evCounterError : styles.evCounter}>
                {remainingEv} remaining
              </span>
            </legend>
            {errors.evTotal && <span className={styles.fieldError}>{errors.evTotal}</span>}
            <div className={styles.evsGrid}>
              {STAT_NAMES.map((statName) => {
                const formKey = EV_FIELD[statName];
                const baseStat = pokemon?.stats.find((s) => s.stat.name === statName)?.base_stat;
                return (
                  <label key={statName} htmlFor={`ev-${statName}`}>
                    <span className={styles.evLabel}>
                      {prettifyItem(statName)}
                      {baseStat !== undefined && (
                        <span className={styles.baseStat}>base {baseStat}</span>
                      )}
                    </span>
                    <input
                      id={`ev-${statName}`}
                      type="number"
                      min={0}
                      max={255}
                      step={1}
                      value={form[formKey] as number}
                      onChange={(e) => set(formKey, Math.min(255, Math.max(0, Number(e.target.value))))}
                      aria-invalid={!!errors[formKey as keyof IAddToTeamErrors]}
                    />
                    {errors[formKey as keyof IAddToTeamErrors] && (
                      <span className={styles.fieldError}>
                        {errors[formKey as keyof IAddToTeamErrors]}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </fieldset>

        </div>

        <button
          type="submit"
          className={styles.submit}
          disabled={loading || !form.teamId || teamFull}
        >
          {loading ? <span className="button-spinner" aria-label="Loading" /> : 'Add to team'}
        </button>
      </form>
    </Modal>
  );
};
