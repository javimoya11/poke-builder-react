import { useQuery } from '@tanstack/react-query';
import { getPokedex } from 'hooks/getPokedex';

export interface MoveDetail {
  type: string | null;
  /** Status moves deal no damage, so they never contribute coverage. */
  damageClass: string | null;
  power: number | null;
}

export type MoveDetailMap = Record<string, MoveDetail>;

export const teamMoveDetailsQueryKey = (moveNames: string[]) =>
  ['team-move-details', { moveNames }] as const;

/**
 * Fetches the detail of the handful of moves a team actually has equipped
 * (at most 24), rather than every move each Pokémon can learn. Each move
 * resource is cached indefinitely by the shared Pokedex client, so moves
 * already loaded by the edit form cost nothing here.
 */
async function fetchTeamMoveDetails(moveNames: string[]): Promise<MoveDetailMap> {
  if (!moveNames.length) return {};

  const pokedex = getPokedex();
  const urls = moveNames.map(
    (name) => `https://pokeapi.co/api/v2/move/${name}/`
  );
  const details = await pokedex.resource(urls);
  const list = (Array.isArray(details) ? details : [details]) as {
    name: string;
    type: { name: string } | null;
    damage_class: { name: string } | null;
    power: number | null;
  }[];

  const map: MoveDetailMap = {};
  list.forEach((move, i) => {
    if (!move) return;
    map[moveNames[i]] = {
      type: move.type?.name ?? null,
      damageClass: move.damage_class?.name ?? null,
      power: move.power ?? null
    };
  });
  return map;
}

/**
 * Hook returning type, damage class and power for every move name given.
 * @param moveNames - The equipped move names across the team.
 */
export const useTeamMoveDetails = (moveNames: string[]) => {
  // Sorted + deduped so the key is stable regardless of slot ordering.
  const names = [...new Set(moveNames)].sort();

  const { data = {}, isLoading } = useQuery({
    queryKey: teamMoveDetailsQueryKey(names),
    queryFn: () => fetchTeamMoveDetails(names),
    enabled: names.length > 0,
    staleTime: Infinity
  });

  return { moveDetails: data, isLoading: names.length > 0 && isLoading };
};

/** Whether a move can actually deal damage, and so can provide coverage. */
export const isDamagingMove = (detail: MoveDetail | undefined): boolean =>
  !!detail && detail.damageClass !== 'status' && (detail.power ?? 0) > 0;
