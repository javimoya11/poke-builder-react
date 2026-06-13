import usePokedex from "./usePokedex";
import { useQuery } from '@tanstack/react-query';

async function fetchPokemonList() {
  const pokedex = usePokedex();
  const res = await pokedex.getPokemonsList({ offset: 0, limit: 1350 });
  if (!res?.results) throw new Error('Failed to fetch pokemon list');
  return res.results;
}

export const usePokemonList = () =>
  useQuery({
    queryKey: ['list'],
    queryFn: fetchPokemonList,
    staleTime: Infinity,
  });
