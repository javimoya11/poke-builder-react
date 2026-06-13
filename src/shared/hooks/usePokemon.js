import usePokedex from "./usePokedex";
import { useQuery } from "@tanstack/react-query";

export const pokemonQueryKey = (id) => ["pokemon", { id }];

export async function fetchPokemon({ queryKey }) {
  const [, { id }] = queryKey;

  if (!id) {
    throw new Error(`poke search not okay`);
  }

  const pokedex = usePokedex();
  const pokemon = await pokedex.getPokemonByName(id);

  if (!pokemon?.id) {
    throw new Error(`poke search not okay`);
  }

  return pokemon;
}

export const usePokemon = (id, options = {}) =>
  useQuery({
    queryKey: pokemonQueryKey(id),
    queryFn: fetchPokemon,
    ...options,
  });
