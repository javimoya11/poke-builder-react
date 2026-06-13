import usePokedex from "./usePokedex";
import { useQuery } from '@tanstack/react-query';

async function fetchPokemonList() {
  const pokedex = usePokedex();
  const res = await pokedex.getPokemonsList({ offset: 0, limit: 10000 })
  if (!res.ok) throw new Error('Failed to fetch')
  return res.results
}

export const usePokemonList = () =>
  useQuery({
    queryKey: ['list'],
    queryFn: fetchPokemonList,
    staleTime: Infinity,
  })

