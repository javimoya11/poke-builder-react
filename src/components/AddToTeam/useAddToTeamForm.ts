import type { QueryClient } from '@tanstack/react-query';
import type { Pokemon } from 'pokeapi-js-wrapper';
import { useMemo, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { usePokemon } from '../../shared/hooks/usePokemon';
import { teamsQueryKey } from '../../shared/hooks/useTeams';
import type { Nature } from '../../shared/hooks/useNatures';
import type { Team, TeamPokemon } from '../../shared/hooks/useTeams';
import {
  defaultAbility,
  defaultGender,
  defaultNature,
  EV_FIELD,
  forcedFormsForSpecies,
  formFromTeamPokemon,
  IAddToTeamErrors,
  IAddToTeamForm,
  INITIAL_FORM,
  isAutoDisplayForm,
  MAX_LEVEL,
  DEFAULT_LEVEL,
  MAX_SINGLE_EV,
  MAX_TOTAL_EV,
  MIN_LEVEL,
  MOVE_SLOTS,
  STAT_NAMES,
  StatName
} from './types.AddToTeam';
import { validateAddToTeam } from './validation.AddToTeam';

interface UseAddToTeamFormArgs {
  editing?: TeamPokemon;
  teamId?: string;
  effectivePokemon?: Pokemon;
  abilityFormRule?: { ability: string; form: string };
  altAbilityFormPokemon?: Pokemon;
  forcedItem?: string;
  originForcedForm?: string;
  natures: Nature[];
  species?: { genderRate: number };
  teams: Team[];
  user: { id: string } | null | undefined;
  queryClient: QueryClient;
  onClose: () => void;
}

/**
 * Owns the AddToTeam form's local state: field values, the level/EV inputs
 * (which need their own raw-text state so they can go empty while typing,
 * see the `onBlur` clamps), the alternate-form display logic, and the
 * submit/delete handlers. `effectivePokemon` (always the base species for
 * forced-item forms) is what gets saved; `displayPokemon` is what the UI
 * shows. For Primal/Crowned forms it switches automatically the instant
 * their item is equipped/removed (no player choice involved); for Mega
 * forms it only switches while `megaViewRequested` is on, since Mega
 * Evolution stays an optional in-battle choice even while holding the stone.
 */
export const useAddToTeamForm = ({
  editing,
  teamId,
  effectivePokemon,
  abilityFormRule,
  altAbilityFormPokemon,
  forcedItem,
  originForcedForm,
  natures,
  species,
  teams,
  user,
  queryClient,
  onClose
}: UseAddToTeamFormArgs) => {
  const isEditing = !!editing;
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [artworkOpen, setArtworkOpen] = useState(false);

  const [form, setForm] = useState<IAddToTeamForm>(() =>
    editing
      ? formFromTeamPokemon(editing, teamId ?? '')
      : {
          ...INITIAL_FORM,
          teamId: teamId ?? '',
          held_item: forcedItem ?? '',
          ability: defaultAbility(effectivePokemon),
          nature: defaultNature(natures),
          gender: defaultGender(species?.genderRate)
        }
  );
  const [levelInput, setLevelInput] = useState(() => String(form.level));
  const [evInputs, setEvInputs] = useState<Record<StatName, string>>(() =>
    Object.fromEntries(
      STAT_NAMES.map((statName) => [statName, String(form[EV_FIELD[statName]])])
    ) as Record<StatName, string>
  );
  const [errors, setErrors] = useState<IAddToTeamErrors>({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const pokemonToSave =
    !isEditing && abilityFormRule && form.ability === abilityFormRule.ability
      ? altAbilityFormPokemon
      : effectivePokemon;

  const abilityOptions = useMemo(() => {
    const base = effectivePokemon?.abilities ?? [];
    if (!abilityFormRule || !altAbilityFormPokemon) return base;
    const already = base.some(
      ({ ability }) => ability.name === abilityFormRule.ability
    );
    if (already) return base;
    const altAbility = altAbilityFormPokemon.abilities.find(
      ({ ability }) => ability.name === abilityFormRule.ability
    );
    return altAbility ? [...base, altAbility] : base;
  }, [effectivePokemon, abilityFormRule, altAbilityFormPokemon]);

  const baseSpeciesForStones = effectivePokemon?.species.name;
  const availableForcedForms = useMemo(
    () => forcedFormsForSpecies(baseSpeciesForStones),
    [baseSpeciesForStones]
  );
  const forcedFormItems = useMemo(
    () => availableForcedForms.map(({ item }) => item),
    [availableForcedForms]
  );

  /**
   * The form whose Mega/Primal/Crowned view should be offered. Prefers a
   * match on the currently selected held item (the normal, data-accurate
   * path, driven by FORCED_FORM_ITEM_MAP); falls back to `originForcedForm`
   * — the Mega/Primal/Crowned card the user actually opened — for newly
   * released forms that aren't in FORCED_FORM_ITEM_MAP yet (the map is
   * updated by hand per generation and can lag behind the PokeAPI data), so
   * the display/switch still works ahead of that map being updated. Once
   * the form is added to the map this fallback stops being needed, since
   * the item match above takes priority again.
   */
  const matchedForm =
    availableForcedForms.find(({ item }) => item === form.held_item)?.form ??
    (!form.held_item ? originForcedForm : undefined);
  const autoDisplayForm =
    matchedForm && isAutoDisplayForm(matchedForm) ? matchedForm : undefined;
  const matchedMegaForm =
    matchedForm && !isAutoDisplayForm(matchedForm) ? matchedForm : undefined;

  const [megaViewRequested, setMegaViewRequested] = useState(false);
  const showMegaView = !!matchedMegaForm && megaViewRequested;

  const formToFetch = autoDisplayForm ?? (showMegaView ? matchedMegaForm : undefined);
  const { data: alternateFormPokemon } = usePokemon(formToFetch, {
    enabled: !!formToFetch
  });

  const displayPokemon = alternateFormPokemon ?? effectivePokemon;

  const selectedTeam = teams.find((t) => String(t.id) === form.teamId);
  const usedSlots = selectedTeam?.team_pokemon?.map((p) => p.slot) ?? [];
  const nextSlot =
    [1, 2, 3, 4, 5, 6].find((slot) => !usedSlots.includes(slot)) ?? 7;
  const teamFull = usedSlots.length >= 6 && form.teamId !== teamId;
  const isMovingTeam = isEditing && form.teamId !== (teamId ?? '');

  const totalEv =
    form.ev_hp +
    form.ev_atk +
    form.ev_def +
    form.ev_spatk +
    form.ev_spdef +
    form.ev_spd;
  const remainingEv = MAX_TOTAL_EV - totalEv;

  const set = <K extends keyof IAddToTeamForm>(
    key: K,
    value: IAddToTeamForm[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const usedMoves = (slot: (typeof MOVE_SLOTS)[number]) =>
    MOVE_SLOTS.filter((s) => s !== slot)
      .map((s) => form[s])
      .filter(Boolean);

  const onLevelChange = (raw: string) => {
    setLevelInput(raw);
    const parsed = Number(raw);
    if (raw !== '' && !Number.isNaN(parsed)) {
      set('level', parsed);
    }
  };

  const onLevelBlur = () => {
    const parsed = Number(levelInput);
    const clamped = Math.min(
      MAX_LEVEL,
      Math.max(MIN_LEVEL, Number.isNaN(parsed) ? DEFAULT_LEVEL : parsed)
    );
    set('level', clamped);
    setLevelInput(String(clamped));
  };

  const onEvChange = (statName: StatName, raw: string) => {
    setEvInputs((prev) => ({ ...prev, [statName]: raw }));
    const parsed = Number(raw);
    if (raw !== '' && !Number.isNaN(parsed)) {
      set(EV_FIELD[statName], parsed);
    }
  };

  const onEvBlur = (statName: StatName) => {
    const parsed = Number(evInputs[statName]);
    const clamped = Math.min(
      MAX_SINGLE_EV,
      Math.max(0, Number.isNaN(parsed) ? 0 : parsed)
    );
    set(EV_FIELD[statName], clamped);
    setEvInputs((prev) => ({ ...prev, [statName]: String(clamped) }));
  };

  const submitHandler = async () => {
    const errs = validateAddToTeam(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      formRef.current
        ?.closest<HTMLElement>('[class*="body"]')
        ?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!effectivePokemon || !pokemonToSave || !user) return;

    const editableFields = {
      nickname: form.nickname || null,
      held_item: form.held_item || null,
      ability: form.ability,
      nature: form.nature || null,
      level: form.level,
      gender: form.gender || null,
      shiny: form.shiny,
      happiness: form.happiness,
      tera_type: form.tera_type || null,
      ev_hp: form.ev_hp,
      ev_atk: form.ev_atk,
      ev_def: form.ev_def,
      ev_spatk: form.ev_spatk,
      ev_spdef: form.ev_spdef,
      ev_spd: form.ev_spd,
      iv_hp: form.iv_hp,
      iv_atk: form.iv_atk,
      iv_def: form.iv_def,
      iv_spatk: form.iv_spatk,
      iv_spdef: form.iv_spdef,
      iv_spd: form.iv_spd,
      move_1: form.move_1 || null,
      move_2: form.move_2 || null,
      move_3: form.move_3 || null,
      move_4: form.move_4 || null
    };

    setLoading(true);
    setFormError(null);
    try {
      const { error } = editing
        ? await supabase
            .from('team_pokemon')
            .update({
              ...editableFields,
              ...(isMovingTeam ? { team_id: form.teamId, slot: nextSlot } : {})
            })
            .eq('id', editing.id)
        : await supabase.from('team_pokemon').insert({
            team_id: form.teamId,
            slot: nextSlot,
            pokemon_name: pokemonToSave.name,
            pokemon_id: pokemonToSave.id,
            ...editableFields
          });
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: teamsQueryKey(user.id) });
      onClose();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Could not save the Pokémon.'
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteHandler = async () => {
    if (!user || !editing) return;
    const { error } = await supabase
      .from('team_pokemon')
      .delete()
      .eq('id', editing.id);
    if (error) throw error;
    await queryClient.invalidateQueries({ queryKey: teamsQueryKey(user.id) });
    onClose();
  };

  return {
    form,
    set,
    levelInput,
    onLevelChange,
    onLevelBlur,
    evInputs,
    onEvChange,
    onEvBlur,
    errors,
    loading,
    formError,
    formRef,
    deleteOpen,
    setDeleteOpen,
    artworkOpen,
    setArtworkOpen,
    pokemonToSave,
    abilityOptions,
    matchedMegaForm,
    megaViewRequested,
    setMegaViewRequested,
    displayPokemon,
    itemForcedFormItems: forcedFormItems,
    teamFull,
    remainingEv,
    usedMoves,
    submitHandler,
    deleteHandler
  };
};
