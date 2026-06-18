import type {
  QueryFunctionContext,
  UseQueryOptions
} from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { Pokemon } from 'pokeapi-js-wrapper';
import getPokedex from './getPokedex';

/**
 * Builds the React Query key for a single Pokémon.
 * @param id - The Pokémon ID (name or numeric id as a string).
 * @returns A stable, readonly query key tuple.
 */
export const pokemonQueryKey = (id?: string) => ['pokemon', { id }] as const;

type PokemonQueryKey = ReturnType<typeof pokemonQueryKey>;

/**
 * Query function that fetches a single Pokémon by ID from PokeAPI.
 * @param context - React Query context carrying the query key.
 * @returns The fetched Pokémon.
 * @throws If the ID is missing or the Pokémon cannot be found.
 */
export async function fetchPokemon({
  queryKey
}: QueryFunctionContext<PokemonQueryKey>): Promise<Pokemon> {
  const [, { id }] = queryKey;

  if (!id) {
    throw new Error(`poke search not okay`);
  }

  const pokedex = getPokedex();
  const pokemon = await pokedex.getPokemonByName(id);

  if (!pokemon?.id) {
    throw new Error(`poke search not okay`);
  }

  return pokemon;
}

type PokemonQueryOptions = Omit<
  UseQueryOptions<Pokemon, Error, Pokemon, PokemonQueryKey>,
  'queryKey' | 'queryFn'
>;

/**
 * React Query hook for fetching a single Pokémon by ID.
 * @param id - The Pokémon ID (name or numeric id as a string).
 * @param options - Additional React Query options (excluding queryKey/queryFn).
 * @returns The React Query result for the Pokémon.
 */
export const usePokemon = (id?: string, options: PokemonQueryOptions = {}) =>
  useQuery({
    queryKey: pokemonQueryKey(id),
    queryFn: fetchPokemon,
    ...options
  });
