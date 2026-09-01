import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { Type } from 'pokeapi-js-wrapper';
import { fetchTypeDetails, TYPE_DETAILS_KEY } from './useTypeIconMap';

type TypeDetailsKey = typeof TYPE_DETAILS_KEY;

/**
 * Attacking type -> defending type -> damage multiplier (0, 0.5, 1 or 2).
 * Pairs left out of a type's damage relations deal neutral damage, so a
 * missing entry means x1.
 */
export type TypeChart = Record<string, Record<string, number>>;

/**
 * Builds the full 18x18 effectiveness chart from the shared type details.
 * Each Type resource lists what it hits for double/half/no damage, which is
 * everything needed — no extra requests on top of `fetchTypeDetails`.
 */
export function buildTypeChart(entries: { url: string; detail: Type }[]): TypeChart {
  const chart: TypeChart = {};
  entries.forEach(({ detail }) => {
    const relations: Record<string, number> = {};
    detail.damage_relations.double_damage_to.forEach((t) => {
      relations[t.name] = 2;
    });
    detail.damage_relations.half_damage_to.forEach((t) => {
      relations[t.name] = 0.5;
    });
    detail.damage_relations.no_damage_to.forEach((t) => {
      relations[t.name] = 0;
    });
    chart[detail.name] = relations;
  });
  return chart;
}

type TypeChartQueryOptions = Omit<
  UseQueryOptions<{ url: string; detail: Type }[], Error, TypeChart, TypeDetailsKey>,
  'queryKey' | 'queryFn' | 'select'
>;

/**
 * React Query hook for the type effectiveness chart, derived from the same
 * 18 type details used by `useTypeIconMap` / `useMoveTypeMap` (same query
 * key), so it never triggers a fetch of its own once any of them has run.
 */
export const useTypeChart = (options: TypeChartQueryOptions = {}) =>
  useQuery({
    queryKey: TYPE_DETAILS_KEY,
    queryFn: fetchTypeDetails,
    staleTime: Infinity,
    select: buildTypeChart,
    ...options
  });

/**
 * Multiplier a move of `attackingType` deals to a Pokémon with
 * `defendingTypes`, multiplying each defending type's relation together.
 */
export const effectivenessAgainst = (
  chart: TypeChart,
  attackingType: string,
  defendingTypes: string[]
): number =>
  defendingTypes.reduce(
    (multiplier, defending) => multiplier * (chart[attackingType]?.[defending] ?? 1),
    1
  );
