import { useQueryClient } from '@tanstack/react-query';
import type { Pokemon } from 'pokeapi-js-wrapper';
import { useMemo } from 'react';
import { useAvailableMoves } from '../../shared/hooks/useAvailableMoves';
import { useHeldItems } from '../../shared/hooks/useHeldItems';
import { useNatures } from '../../shared/hooks/useNatures';
import { usePokemon } from '../../shared/hooks/usePokemon';
import { useSpecies } from '../../shared/hooks/useSpecies';
import { useTeams } from '../../shared/hooks/useTeams';
import { useTypeIconMap } from '../../shared/hooks/useTypeIconMap';
import { useGlobalStore } from '../../shared/stores/useGlobalStore';
import type { TeamPokemon } from '../../shared/hooks/useTeams';
import {
  ABILITY_FORM_MAP,
  getForcedItem,
  isForcedItemForm
} from './types.AddToTeam';

/**
 * Resolves every piece of read-only data `AddToTeam` needs: the Pokémon
 * being edited/added (`effectivePokemon`, always the base species for
 * forced-item forms like Mega/Primal so saving stays Showdown-compatible),
 * its alternate-ability variety, and the surrounding lists (teams, items,
 * natures, moves, species, type icons). Also reports whether that data has
 * finished loading via `dataReady`.
 */
export const useAddToTeamData = (
  pokemon: Pokemon | undefined,
  editing: TeamPokemon | undefined
) => {
  const isEditing = !!editing;

  const isForcedItem = useMemo(
    () => isForcedItemForm(pokemon?.name),
    [pokemon?.name]
  );
  const forcedItem = useMemo(
    () => getForcedItem(pokemon?.name),
    [pokemon?.name]
  );
  const baseSpeciesName = pokemon?.species.name;

  const abilityFormRule = pokemon ? ABILITY_FORM_MAP[pokemon.name] : undefined;

  const queryClient = useQueryClient();
  const user = useGlobalStore((s) => s.user);
  const { data: teams = [] } = useTeams(user?.id);

  const { data: editingPokemon } = usePokemon(editing?.pokemon_id, {
    enabled: isEditing && !!editing?.pokemon_id
  });
  const { data: basePokemon } = usePokemon(baseSpeciesName, {
    enabled: !isEditing && isForcedItem && !!baseSpeciesName
  });
  const { data: altAbilityFormPokemon } = usePokemon(abilityFormRule?.form, {
    enabled: !isEditing && !!abilityFormRule
  });

  const effectivePokemon = isEditing
    ? editingPokemon
    : isForcedItem
      ? basePokemon
      : pokemon;

  /**
   * The exact Mega/Primal/Crowned form name the user opened the form from
   * (e.g. `charizard-mega-x`), when applicable. Used as a fallback so the
   * Mega display/switch still works even before its stone/orb exists in
   * `heldItems` (the item API data can lag behind new-gen additions) — see
   * `useAddToTeamForm`'s `matchedForm` resolution.
   */
  const originForcedForm =
    !isEditing && isForcedItem ? pokemon?.name : undefined;

  const { data: heldItems = [], isLoading: heldItemsLoading } = useHeldItems();
  const { data: natures = [], isLoading: naturesLoading } = useNatures();
  const moves = useAvailableMoves(effectivePokemon);

  const speciesEnabled = !isEditing && !!effectivePokemon?.species.name;
  const { data: species, isLoading: speciesLoading } = useSpecies(
    effectivePokemon?.species.name,
    { enabled: speciesEnabled }
  );

  const { data: typeIconMap = {} } = useTypeIconMap();

  const dataReady = isEditing
    ? !!editingPokemon
    : !!effectivePokemon &&
      !naturesLoading &&
      (!speciesEnabled || !speciesLoading);

  return {
    effectivePokemon,
    abilityFormRule,
    altAbilityFormPokemon,
    forcedItem,
    originForcedForm,
    natures,
    species,
    heldItems,
    heldItemsLoading,
    moves,
    typeIconMap,
    teams,
    user,
    queryClient,
    dataReady
  };
};
