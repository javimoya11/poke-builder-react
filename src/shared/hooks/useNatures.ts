import { useQuery } from '@tanstack/react-query';
import { getPokedex } from './getPokedex';

export interface Nature {
  name: string;
  increased_stat: string | null;
  decreased_stat: string | null;
}

const naturesQueryKey = () => ['natures'] as const;

async function fetchNatures(): Promise<Nature[]> {
  const pokedex = getPokedex();
  const list = await pokedex.getNaturesList({ offset: 0, limit: 25 });
  const details = await Promise.all(
    list.results.map((n: { name: string }) => pokedex.getNatureByName(n.name))
  );
  return details
    .map((n) => ({
      name: n.name as string,
      increased_stat: (n.increased_stat?.name ?? null) as string | null,
      decreased_stat: (n.decreased_stat?.name ?? null) as string | null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export const useNatures = () =>
  useQuery({
    queryKey: naturesQueryKey(),
    queryFn: fetchNatures,
    staleTime: Infinity,
  });
