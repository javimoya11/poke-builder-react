import getPokedex from "./getPokedex";
import { useQuery } from '@tanstack/react-query';
import type { NamedAPIResource } from 'pokeapi-js-wrapper';

/**
 * Query function that fetches the full list of Pokémon (name + URL) from PokeAPI.
 * @returns The list of Pokémon resources.
 * @throws If the list cannot be fetched.
 */
async function fetchPokemonList(): Promise<NamedAPIResource[]> {
  const pokedex = getPokedex();
  const res = await pokedex.getPokemonsList({ offset: 0, limit: 1350 });
  if (!res?.results) throw new Error('Failed to fetch pokemon list');
  return res.results;
}

/**
 * React Query hook for the full Pokémon list. Cached indefinitely (staleTime: Infinity).
 * @returns The React Query result for the Pokémon list.
 */
export const usePokemonList = () =>
  useQuery({
    queryKey: ['list'],
    queryFn: fetchPokemonList,
    staleTime: Infinity,
  });
