import { useQueries } from '@tanstack/react-query';
import type { Pokemon } from 'pokeapi-js-wrapper';
import { useMemo } from 'react';
import { fetchPokemon, pokemonQueryKey } from 'hooks/usePokemon';
import { effectivenessAgainst, useTypeChart } from 'hooks/useTypeChart';
import type { TeamPokemon } from 'hooks/useTeams';
import { TERA_TYPES } from 'components/AddToTeam/types.AddToTeam';
import { abilityMultiplier, isDefensiveAbility } from './defensiveAbilities';
import { isDamagingMove, useTeamMoveDetails } from './useTeamMoveDetails';

/** The 18 elemental types, in the canonical PokeAPI order. */
export const ALL_TYPES = TERA_TYPES;

/** How a single team member fares defensively against one attacking type. */
export type DefenseMark = 'weak' | 'resist' | 'neutral';

/**
 * How a single team member covers one type: through one of its own types
 * (`stab`), only through an equipped move (`move`), or not at all. STAB wins
 * when both apply, since that coverage comes with the damage bonus.
 */
export type CoverageMark = 'stab' | 'move' | 'none';

export interface AnalysedPokemon {
  entry: TeamPokemon;
  types: string[];
  /** Types this Pokémon hits super-effectively, by how it reaches them. */
  coverage: Record<string, CoverageMark>;
  /** Type -> the equipped moves that hit it super-effectively, if any. */
  coveringMoves: Record<string, string[]>;
  /** The ability, only when it changes this Pokémon's type effectiveness. */
  relevantAbility: string | null;
}

export interface TeamAnalysis {
  pokemon: AnalysedPokemon[];
  /** attacking type -> one mark per team member, in team slot order. */
  defense: Record<string, DefenseMark[]>;
  /** defending type -> how each team member covers it, in slot order. */
  coverage: Record<string, CoverageMark[]>;
  isLoading: boolean;
}

/**
 * Resolves everything the team type analysis needs: each member's types (a
 * cached per-Pokémon fetch, shared with the rest of the app), the type chart
 * (derived from the single cached type-details query, so it costs no extra
 * request) and the detail of the moves the team actually has equipped.
 *
 * Defense marks each member as weak (>x1 incoming), resist (<x1, immunities
 * included) or neutral against every attacking type, folding in abilities
 * that change type effectiveness (Levitate, Thick Fat, Dry Skin…) on top of
 * the type chart — see `defensiveAbilities.ts`. Coverage marks how a
 * member reaches each type super-effectively: through one of its own types
 * (STAB, which wins when both apply), through an equipped move only, or not
 * at all.
 */
export const useTeamAnalysis = (team: TeamPokemon[]): TeamAnalysis => {
  const { data: chart = {}, isLoading: chartLoading } = useTypeChart();
  const equippedMoves = team.flatMap((poke) =>
    [poke.move_1, poke.move_2, poke.move_3, poke.move_4].filter(
      (move): move is string => !!move
    )
  );
  const { moveDetails, isLoading: movesLoading } =
    useTeamMoveDetails(equippedMoves);

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
      // Status moves deal no damage, so they never provide coverage however
      // favourable their type matchup looks.
      const damagingMoves = moveNames.filter((move) =>
        isDamagingMove(moveDetails[move])
      );
      const moveAttackTypes = damagingMoves
        .map((move) => moveDetails[move]?.type)
        .filter((type): type is string => !!type);
      const hits = (attackingTypes: string[], defending: string) =>
        attackingTypes.some(
          (attacking) => (chart[attacking]?.[defending] ?? 1) > 1
        );

      const coverage: Record<string, CoverageMark> = {};
      const coveringMoves: Record<string, string[]> = {};
      ALL_TYPES.forEach((defending) => {
        // STAB takes precedence: same coverage, but with the damage bonus.
        if (hits(types, defending)) coverage[defending] = 'stab';
        else if (hits(moveAttackTypes, defending)) coverage[defending] = 'move';
        else coverage[defending] = 'none';

        // Tracked regardless of the mark: on a STAB hit the same-type moves
        // are what actually land it, so they're the ones worth pointing at.
        coveringMoves[defending] = damagingMoves.filter((move) => {
          const moveType = moveDetails[move]?.type;
          return !!moveType && (chart[moveType]?.[defending] ?? 1) > 1;
        });
      });

      return {
        entry,
        types,
        coverage,
        coveringMoves,
        relevantAbility: isDefensiveAbility(entry.ability) ? entry.ability : null
      };
    });

    const defense: Record<string, DefenseMark[]> = {};
    const coverage: Record<string, CoverageMark[]> = {};

    ALL_TYPES.forEach((type) => {
      defense[type] = analysed.map(({ types, entry }) => {
        if (!types.length) return 'neutral';
        const multiplier =
          effectivenessAgainst(chart, type, types) *
          abilityMultiplier(entry.ability, type);
        if (multiplier > 1) return 'weak';
        if (multiplier < 1) return 'resist';
        return 'neutral';
      });
      coverage[type] = analysed.map((poke) => poke.coverage[type]);
    });

    return {
      pokemon: analysed,
      defense,
      coverage,
      isLoading: chartLoading || movesLoading || pokemonLoading
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team, fetchedKey, chart, moveDetails, chartLoading, movesLoading, pokemonLoading]);
};
