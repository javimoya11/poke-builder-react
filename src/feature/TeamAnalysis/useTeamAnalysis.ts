import { useQueries } from '@tanstack/react-query';
import type { Pokemon } from 'pokeapi-js-wrapper';
import { useMemo } from 'react';
import { fetchPokemon, pokemonQueryKey } from 'hooks/usePokemon';
import { useMoveTypeMap } from 'hooks/useTypeIconMap';
import { effectivenessAgainst, useTypeChart } from 'hooks/useTypeChart';
import type { TeamPokemon } from 'hooks/useTeams';
import { TERA_TYPES } from 'components/AddToTeam/types.AddToTeam';

/** The 18 elemental types, in the canonical PokeAPI order. */
export const ALL_TYPES = TERA_TYPES;

/** How a single team member fares defensively against one attacking type. */
export type DefenseMark = 'weak' | 'resist' | 'neutral';

export interface AnalysedPokemon {
  entry: TeamPokemon;
  types: string[];
  /** Types this Pokémon hits super-effectively, plus its own (STAB) types. */
  coveredTypes: Set<string>;
}

export interface TeamAnalysis {
  pokemon: AnalysedPokemon[];
  /** attacking type -> one mark per team member, in team slot order. */
  defense: Record<string, DefenseMark[]>;
  /** defending type -> whether each team member covers it, in slot order. */
  coverage: Record<string, boolean[]>;
  isLoading: boolean;
}

/**
 * Resolves everything the team type analysis needs: each member's types (a
 * cached per-Pokémon fetch, shared with the rest of the app) and the type
 * chart plus move-type map (both derived from the single cached type-details
 * query, so they cost no extra request).
 *
 * Defense marks each member as weak (>x1 incoming), resist (<x1, immunities
 * included) or neutral against every attacking type. Coverage marks a member
 * as covering a type when it has a damaging move that is super-effective
 * against it, or when the type is hit super-effectively by one of the
 * member's own types (STAB).
 */
export const useTeamAnalysis = (team: TeamPokemon[]): TeamAnalysis => {
  const { data: chart = {}, isLoading: chartLoading } = useTypeChart();
  const { data: moveTypes = {}, isLoading: moveTypesLoading } = useMoveTypeMap();

  const pokemonQueries = useQueries({
    queries: team.map((poke) => ({
      queryKey: pokemonQueryKey(poke.pokemon_id),
      queryFn: fetchPokemon,
      staleTime: Infinity
    }))
  });

  const pokemonLoading = pokemonQueries.some((query) => query.isLoading);
  const fetched = pokemonQueries.map((query) => query.data as Pokemon | undefined);
  // useQueries returns a new array identity every render; key the memo on the
  // resolved ids instead so the analysis is only recomputed when data lands.
  const fetchedKey = fetched.map((p) => p?.id ?? '').join(',');

  return useMemo(() => {
    const analysed: AnalysedPokemon[] = team.map((entry, i) => {
      const types = fetched[i]?.types.map((t) => t.type.name) ?? [];
      const moveNames = [entry.move_1, entry.move_2, entry.move_3, entry.move_4]
        .filter((move): move is string => !!move);
      const attackingTypes = new Set(
        moveNames
          .map((move) => moveTypes[move])
          .filter((type): type is string => !!type)
          .concat(types)
      );

      const coveredTypes = new Set<string>();
      ALL_TYPES.forEach((defending) => {
        const covers = [...attackingTypes].some(
          (attacking) => (chart[attacking]?.[defending] ?? 1) > 1
        );
        if (covers) coveredTypes.add(defending);
      });

      return { entry, types, coveredTypes };
    });

    const defense: Record<string, DefenseMark[]> = {};
    const coverage: Record<string, boolean[]> = {};

    ALL_TYPES.forEach((type) => {
      defense[type] = analysed.map(({ types }) => {
        if (!types.length) return 'neutral';
        const multiplier = effectivenessAgainst(chart, type, types);
        if (multiplier > 1) return 'weak';
        if (multiplier < 1) return 'resist';
        return 'neutral';
      });
      coverage[type] = analysed.map(({ coveredTypes }) => coveredTypes.has(type));
    });

    return {
      pokemon: analysed,
      defense,
      coverage,
      isLoading: chartLoading || moveTypesLoading || pokemonLoading
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team, fetchedKey, chart, moveTypes, chartLoading, moveTypesLoading, pokemonLoading]);
};
