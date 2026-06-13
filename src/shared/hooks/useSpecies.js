import usePokedex from "./usePokedex";
import { useQuery } from "@tanstack/react-query";

export const speciesQueryKey = (id) => ["species", { id }];

const idFromUrl = (url) => url.match(/(?<=\/pokemon\/)(\d+|\d)/gm)?.[0];

export async function fetchSpecies({ queryKey }) {
  const [, { id }] = queryKey;

  if (!id) {
    throw new Error(`species search not okay`);
  }

  const pokedex = usePokedex();
  const species = await pokedex.getPokemonSpeciesByName(id);

  if (!species?.varieties) {
    throw new Error(`species search not okay`);
  }

  const varieties = species.varieties.map((v) => ({
    name: v.pokemon.name,
    id: idFromUrl(v.pokemon.url),
    isDefault: v.is_default,
  }));

  varieties.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

  return { name: species.name, varieties };
}

export const useSpecies = (id, options = {}) =>
  useQuery({
    queryKey: speciesQueryKey(id),
    queryFn: fetchSpecies,
    staleTime: Infinity,
    ...options,
  });
