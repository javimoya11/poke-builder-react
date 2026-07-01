import { useQueryClient } from '@tanstack/react-query';
import { Modal } from 'feature/Modal/Modal';
import { useEffect, useMemo, useRef, useState } from 'react';
import { cachedImage, spriteUrl } from 'utils/cachedImage';
import { idFromUrl } from 'utils/idFromUrl';
import { statColor } from 'utils/statColor';
import { prettify, prettifyItem } from 'utils/string-utils';
import { supabase } from '../../lib/supabase';
import { useAvailableMoves } from '../../shared/hooks/useAvailableMoves';
import { useHeldItems } from '../../shared/hooks/useHeldItems';
import { useNatures } from '../../shared/hooks/useNatures';
import { usePokemon } from '../../shared/hooks/usePokemon';
import { teamsQueryKey, useTeams } from '../../shared/hooks/useTeams';
import { useTypeIconMap } from '../../shared/hooks/useTypeIconMap';
import { useGlobalStore } from '../../shared/stores/useGlobalStore';
import styles from './AddToTeam.module.css';
import {
  EV_FIELD,
  formFromTeamPokemon,
  GENDERS,
  getForcedItem,
  IAddToTeam,
  IAddToTeamErrors,
  IAddToTeamForm,
  INITIAL_FORM,
  isMegaOrPrimal,
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

export const AddToTeam = ({ open, onClose, pokemon, editing, teamId }: IAddToTeam) => {
  const isEditing = !!editing;

  // Mega/Primal forms are stored in Showdown as the base species holding the
  // corresponding stone/orb. When one is opened (create mode) we resolve to its
  // base species and pre-fill (but do not lock) the item with that stone. Edited
  // rows already store the base species, so no resolution is needed there.
  const isMega     = useMemo(() => isMegaOrPrimal(pokemon?.name), [pokemon?.name]);
  const forcedItem = useMemo(() => getForcedItem(pokemon?.name), [pokemon?.name]);
  const baseSpeciesName = pokemon?.species.name;

  const [form, setForm]     = useState<IAddToTeamForm>({ ...INITIAL_FORM, held_item: forcedItem ?? '' });
  const [errors, setErrors] = useState<IAddToTeamErrors>({});
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const queryClient = useQueryClient();
  const user = useGlobalStore((s) => s.user);
  const { data: teams = [] } = useTeams(user?.id);

  // Edit mode loads its Pokémon from the stored id; create mode resolves the
  // base species of the passed-in form. Either way `effectivePokemon` is the
  // base-species Pokémon that drives the header, selects, stats and the write.
  const { data: editingPokemon } = usePokemon(editing?.pokemon_id, {
    enabled: isEditing && !!editing?.pokemon_id
  });
  const { data: basePokemon } = usePokemon(baseSpeciesName, {
    enabled: !isEditing && isMega && !!baseSpeciesName
  });
  const effectivePokemon = isEditing
    ? editingPokemon
    : isMega
      ? basePokemon
      : pokemon;

  const { data: heldItems = [], isLoading: heldItemsLoading } = useHeldItems();
  const { data: natures = [] } = useNatures();
  const moves = useAvailableMoves(effectivePokemon);

  const { data: typeIconMap = {} } = useTypeIconMap();
  const typeIcons = effectivePokemon?.types
    ? effectivePokemon.types.map((entry) => ({
        name: entry.type.name,
        icon: typeIconMap[entry.type.url] ?? null
      }))
    : [];

  const selectedNature = natures.find((n) => n.name === form.nature);
  const natureIncreasedStat = selectedNature?.increased_stat
    ? NATURE_STAT[selectedNature.increased_stat] ?? null
    : null;
  const natureDecreasedStat = selectedNature?.decreased_stat
    ? NATURE_STAT[selectedNature.decreased_stat] ?? null
    : null;

  // The forced stone lives outside the held-items list, so surface it as an
  // extra option (still selectable/changeable) alongside the regular items.
  const itemOptions = useMemo(() => {
    if (!forcedItem || heldItems.some((i) => i.name === forcedItem)) {
      return heldItems;
    }
    return [{ name: forcedItem, url: '' }, ...heldItems];
  }, [forcedItem, heldItems]);

  const selectedTeam = teams.find((t) => String(t.id) === form.teamId);
  const usedSlots    = selectedTeam?.team_pokemon?.map((p) => p.slot) ?? [];
  const nextSlot     = usedSlots.length > 0 ? Math.max(...usedSlots) + 1 : 1;
  const teamFull     = usedSlots.length >= 6;

  const totalEv = form.ev_hp + form.ev_atk + form.ev_def + form.ev_spatk + form.ev_spdef + form.ev_spd;
  const remainingEv = MAX_TOTAL_EV - totalEv;

  useEffect(() => {
    if (!open) return;
    setForm(
      editing
        ? formFromTeamPokemon(editing, teamId ?? '')
        : { ...INITIAL_FORM, held_item: forcedItem ?? '' }
    );
    setErrors({});
    setLoading(false);
  }, [open, forcedItem, editing, teamId]);

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
    if (!effectivePokemon || !user) return;

    // Fields the user can edit in both modes. Species/team/slot are set only on
    // insert (they cannot change while editing).
    const editableFields = {
      nickname:  form.nickname || null,
      held_item: form.held_item || null,
      ability:   form.ability,
      nature:    form.nature || null,
      level:     form.level,
      gender:    form.gender || null,
      shiny:     form.shiny,
      happiness: form.happiness,
      tera_type: form.tera_type || null,
      ev_hp:     form.ev_hp,
      ev_atk:    form.ev_atk,
      ev_def:    form.ev_def,
      ev_spatk:  form.ev_spatk,
      ev_spdef:  form.ev_spdef,
      ev_spd:    form.ev_spd,
      iv_hp:     form.iv_hp,
      iv_atk:    form.iv_atk,
      iv_def:    form.iv_def,
      iv_spatk:  form.iv_spatk,
      iv_spdef:  form.iv_spdef,
      iv_spd:    form.iv_spd,
      move_1:    form.move_1 || null,
      move_2:    form.move_2 || null,
      move_3:    form.move_3 || null,
      move_4:    form.move_4 || null,
    };

    setLoading(true);
    const { error } = editing
      ? await supabase.from('team_pokemon').update(editableFields).eq('id', editing.id)
      : await supabase.from('team_pokemon').insert({
          team_id:      form.teamId,
          slot:         nextSlot,
          pokemon_name: effectivePokemon.name,
          pokemon_id:   effectivePokemon.id,
          ...editableFields,
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
          {effectivePokemon && (
            <img
              src={cachedImage(spriteUrl(effectivePokemon.id, form.shiny), 48)}
              alt={effectivePokemon.name}
              className={styles.headerSprite}
            />
          )}
          <div>
            <span className={styles.headerDex}>
              #{idFromUrl(effectivePokemon?.species.url ?? '')}
            </span>
            <span className={styles.headerName}>
              {prettify(effectivePokemon?.name ?? '')}
            </span>
            {typeIcons.length > 0 && (
              <span className={styles.headerTypes}>
                {typeIcons.map(
                  (type) =>
                    type.icon && (
                      <img key={type.name} src={type.icon} alt={type.name} />
                    )
                )}
              </span>
            )}
          </div>

          <label htmlFor="nickname" className={styles.headerField}>
            Nickname
            <input
              id="nickname"
              type="text"
              value={form.nickname}
              placeholder={prettify(effectivePokemon?.name ?? '')}
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
        {/* Left column: metadata + moves · Right column: unified stats table */}
        <div className={styles.formInputs}>

          <div className={styles.formLeft}>
            <div className={styles.row}>
              <label htmlFor="team-name">
                Team
                <select
                  id="team-name"
                  value={form.teamId}
                  onChange={(e) => set('teamId', e.target.value)}
                  aria-invalid={!!errors.teamId}
                  disabled={isEditing}
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
                  disabled={heldItemsLoading}
                >
                  <option value="">{heldItemsLoading ? 'Loading...' : 'None'}</option>
                  {itemOptions.map((item) => (
                    <option key={item.name} value={item.name}>{prettifyItem(item.name)}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className={styles.row}>
              <label htmlFor="ability">
                Ability
                <select
                  id="ability"
                  value={form.ability}
                  onChange={(e) => set('ability', e.target.value)}
                  aria-invalid={!!errors.ability}
                >
                  <option value="" disabled hidden>Select an ability...</option>
                  {effectivePokemon?.abilities.map(({ ability }) => (
                    <option key={ability.name} value={ability.name}>
                      {prettifyItem(ability.name)}
                    </option>
                  ))}
                </select>
                {errors.ability && <span className={styles.fieldError}>{errors.ability}</span>}
              </label>

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
            </div>

            <div className={styles.row}>
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
            </div>

            <div className={styles.row}>
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

              <label htmlFor="shiny" className={styles.shinyLabel}>
                <input
                  id="shiny"
                  type="checkbox"
                  checked={form.shiny}
                  onChange={(e) => set('shiny', e.target.checked)}
                />
                Shiny
              </label>
            </div>
          </div>

          {/* Right column: unified stats table (base · bar · EV · IV) */}
          <div className={styles.formRight}>
            <fieldset className={styles.statsFieldset}>
              <legend>Stats</legend>
              {errors.evTotal && <span className={styles.fieldError}>{errors.evTotal}</span>}
              <div className={styles.statsTable}>
                <span className={styles.statsHeadCell}>Base</span>
                <span className={`${styles.statsHeadCell} ${styles.statsHeadCenter}`}>EV</span>
                <span className={`${styles.statsHeadCell} ${styles.statsHeadCenter}`}>IV</span>

                {STAT_NAMES.map((statName) => {
                  const evKey = EV_FIELD[statName];
                  const ivKey = IV_FIELD[statName];
                  const baseStat = effectivePokemon?.stats.find((s) => s.stat.name === statName)?.base_stat ?? 0;
                  const isUp   = natureIncreasedStat === statName;
                  const isDown = natureDecreasedStat === statName;
                  return (
                    <div key={statName} className={styles.statRow}>
                      <div className={styles.statBase}>
                        <span className={`${styles.statName} ${isUp ? styles.statUp : isDown ? styles.statDown : ''}`}>
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
                        max={255}
                        step={1}
                        value={form[evKey] as number}
                        onChange={(e) => set(evKey, Math.min(255, Math.max(0, Number(e.target.value))))}
                        aria-invalid={!!errors[evKey as keyof IAddToTeamErrors]}
                      />
                      <input
                        aria-label={`${prettifyItem(statName)} IV`}
                        type="number"
                        min={0}
                        max={MAX_IV}
                        step={1}
                        value={form[ivKey] as number}
                        onChange={(e) => set(ivKey, Math.min(MAX_IV, Math.max(0, Number(e.target.value))))}
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
          </div>

        </div>

        {/* Moves: full width, below the two columns */}
        <fieldset className={styles.movesFieldset}>
          <legend>Moves</legend>
          <div className={`${styles.movesGrid} ${styles.movesGridFull}`}>
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

        <button
          type="submit"
          className={styles.submit}
          disabled={
            loading ||
            !effectivePokemon ||
            (!isEditing && (!form.teamId || teamFull))
          }
        >
          {loading ? (
            <span className="button-spinner" aria-label="Loading" />
          ) : isEditing ? (
            'Update Pokémon'
          ) : (
            'Add to team'
          )}
        </button>
      </form>
    </Modal>
  );
};
