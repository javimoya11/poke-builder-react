import { useQueryClient } from '@tanstack/react-query';
import { Modal } from 'feature/Modal/Modal';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cachedImage, spriteUrl } from 'utils/cachedImage';
import { idFromUrl } from 'utils/idFromUrl';
import { prettifyItem } from 'utils/string-utils';
import { supabase } from '../../lib/supabase';
import { useAvailableMoves } from '../../shared/hooks/useAvailableMoves';
import { useHeldItems } from '../../shared/hooks/useHeldItems';
import { useItem } from '../../shared/hooks/useItem';
import { useNatures } from '../../shared/hooks/useNatures';
import { teamsQueryKey, useTeams } from '../../shared/hooks/useTeams';
import { useGlobalStore } from '../../shared/stores/useGlobalStore';
import styles from './AddToTeam.module.css';
import {
  EV_FIELD,
  GENDERS,
  getForcedItem,
  IAddToTeam,
  IAddToTeamErrors,
  IAddToTeamForm,
  INITIAL_FORM,
  isUnmappedMega,
  IV_FIELD,
  MAX_HAPPINESS,
  MAX_IV,
  MAX_LEVEL,
  MAX_TOTAL_EV,
  MIN_LEVEL,
  MOVE_SLOTS,
  NATURE_STAT,
  STAT_NAMES,
  TERA_TYPES,
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
  const formRef = useRef<HTMLFormElement>(null);

  const queryClient = useQueryClient();
  const user = useGlobalStore((s) => s.user);
  const { data: teams = [] } = useTeams(user?.id);
  const { data: heldItems = [], isLoading: heldItemsLoading } = useHeldItems({ enabled: !itemBlocked });
  const { data: forcedItemData, isLoading: forcedItemLoading }  = useItem(forcedItem);
  const { data: natures = [] } = useNatures();
  const moves = useAvailableMoves(pokemon);

  const selectedNature = natures.find((n) => n.name === form.nature);
  const natureIncreasedStat = selectedNature?.increased_stat
    ? NATURE_STAT[selectedNature.increased_stat] ?? null
    : null;
  const natureDecreasedStat = selectedNature?.decreased_stat
    ? NATURE_STAT[selectedNature.decreased_stat] ?? null
    : null;

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
      formRef.current?.closest<HTMLElement>('[class*="overlay"]')?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!pokemon || !user) return;
    setLoading(true);
    const { error } = await supabase.from('team_pokemon').insert({
      team_id:      form.teamId,
      slot:         nextSlot,
      pokemon_name: pokemon.name,
      pokemon_id:   pokemon.id,
      nickname:     form.nickname || null,
      held_item:    form.held_item || null,
      ability:      form.ability,
      nature:       form.nature || null,
      level:        form.level,
      gender:       form.gender || null,
      shiny:        form.shiny,
      happiness:    form.happiness,
      tera_type:    form.tera_type || null,
      ev_hp:        form.ev_hp,
      ev_atk:       form.ev_atk,
      ev_def:       form.ev_def,
      ev_spatk:     form.ev_spatk,
      ev_spdef:     form.ev_spdef,
      ev_spd:       form.ev_spd,
      iv_hp:        form.iv_hp,
      iv_atk:       form.iv_atk,
      iv_def:       form.iv_def,
      iv_spatk:     form.iv_spatk,
      iv_spdef:     form.iv_spdef,
      iv_spd:       form.iv_spd,
      move_1:       form.move_1 || null,
      move_2:       form.move_2 || null,
      move_3:       form.move_3 || null,
      move_4:       form.move_4 || null,
    });
    setLoading(false);
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: teamsQueryKey(user.id) });
    onClose();
  };

  return (
    <Modal isOpen={open} onClose={onClose}>
      <form
        ref={formRef}
        className={styles.addToTeamForm}
        onSubmit={async (e) => {
          e.preventDefault();
          await submitHandler();
        }}
      >
        <header className={styles.formHeader}>
          {pokemon && (
            <img
              src={cachedImage(spriteUrl(pokemon.id, form.shiny), 48)}
              alt={pokemon.name}
              className={styles.headerSprite}
            />
          )}
          <div>
            <span className={styles.headerDex}>
              #{idFromUrl(pokemon?.species.url ?? '')}
            </span>
            <span className={styles.headerName}>
              {prettifyItem(pokemon?.name ?? '')}
            </span>
          </div>

          <label htmlFor="nickname" className={styles.headerField}>
            Nickname
            <input
              id="nickname"
              type="text"
              value={form.nickname}
              placeholder={prettifyItem(pokemon?.name ?? '')}
              maxLength={30}
              onChange={(e) => set('nickname', e.target.value)}
            />
          </label>

          <label htmlFor="level" className={styles.headerFieldNarrow}>
            Level
            <input
              id="level"
              type="number"
              min={MIN_LEVEL}
              max={MAX_LEVEL}
              step={1}
              value={form.level}
              onChange={(e) =>
                set('level', Math.min(MAX_LEVEL, Math.max(MIN_LEVEL, Number(e.target.value))))
              }
              aria-invalid={!!errors.level}
            />
            {errors.level && <span className={styles.fieldError}>{errors.level}</span>}
          </label>
        </header>
        <div className={styles.formInputs}>

          {/* Left column: team, item, ability + moves */}
          <div className={styles.formLeft}>
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

            <label htmlFor="shiny" className={styles.shinyLabel}>
              <input
                id="shiny"
                type="checkbox"
                checked={form.shiny}
                onChange={(e) => set('shiny', e.target.checked)}
              />
              Shiny
            </label>

            {/* Moves: 2×2 grid, inside left column */}
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
          </div>

          {/* Right column: nature + EVs */}
          <div className={styles.formRight}>
            <div className={styles.row}>
              <label htmlFor="nature">
                Nature
                <select
                  id="nature"
                  value={form.nature}
                  onChange={(e) => set('nature', e.target.value)}
                >
                  <option value="">None</option>
                  {natures.map((n) => (
                    <option key={n.name} value={n.name}>
                      {prettifyItem(n.name)}
                      {n.increased_stat && n.decreased_stat && n.increased_stat !== n.decreased_stat
                        ? ` (+${prettifyItem(n.increased_stat)} / -${prettifyItem(n.decreased_stat)})`
                        : ''}
                    </option>
                  ))}
                </select>
              </label>

              <label htmlFor="tera">
                Tera type
                <select
                  id="tera"
                  value={form.tera_type}
                  onChange={(e) => set('tera_type', e.target.value as IAddToTeamForm['tera_type'])}
                >
                  <option value="">None</option>
                  {TERA_TYPES.map((type) => (
                    <option key={type} value={type}>{prettifyItem(type)}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className={styles.row}>
              <label htmlFor="gender">
                Gender
                <select
                  id="gender"
                  value={form.gender}
                  onChange={(e) => set('gender', e.target.value as IAddToTeamForm['gender'])}
                >
                  <option value="">Unspecified</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>{prettifyItem(g)}</option>
                  ))}
                </select>
              </label>

              <label htmlFor="happiness">
                Happiness
                <input
                  id="happiness"
                  type="number"
                  min={0}
                  max={MAX_HAPPINESS}
                  step={1}
                  value={form.happiness}
                  onChange={(e) =>
                    set('happiness', Math.min(MAX_HAPPINESS, Math.max(0, Number(e.target.value))))
                  }
                  aria-invalid={!!errors.happiness}
                />
                {errors.happiness && <span className={styles.fieldError}>{errors.happiness}</span>}
              </label>
            </div>

            <fieldset className={styles.evsFieldset}>
              <legend>IVs</legend>
              <div className={styles.evsGrid}>
                {STAT_NAMES.map((statName) => {
                  const formKey = IV_FIELD[statName];
                  return (
                    <label key={statName} htmlFor={`iv-${statName}`}>
                      <span className={styles.evLabel}>
                        <span>{prettifyItem(statName)}</span>
                      </span>
                      <input
                        id={`iv-${statName}`}
                        type="number"
                        min={0}
                        max={MAX_IV}
                        step={1}
                        value={form[formKey] as number}
                        onChange={(e) => set(formKey, Math.min(MAX_IV, Math.max(0, Number(e.target.value))))}
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

        </div>

        {/* EVs: full width, below the two columns */}
        <fieldset className={`${styles.evsFieldset} ${styles.evsFull}`}>
          <legend>
            EVs
            <span className={remainingEv < 0 ? styles.evCounterError : styles.evCounter}>
              {remainingEv} remaining
            </span>
          </legend>
          {errors.evTotal && <span className={styles.fieldError}>{errors.evTotal}</span>}
          <div className={`${styles.evsGrid} ${styles.evsGridFull}`}>
            {STAT_NAMES.map((statName) => {
              const formKey = EV_FIELD[statName];
              const baseStat = pokemon?.stats.find((s) => s.stat.name === statName)?.base_stat;
              const isUp   = natureIncreasedStat === statName;
              const isDown = natureDecreasedStat === statName;
              return (
                <label key={statName} htmlFor={`ev-${statName}`}>
                  <span className={styles.evLabel}>
                    <span className={isUp ? styles.statUp : isDown ? styles.statDown : undefined}>
                      {prettifyItem(statName)}
                    </span>
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
