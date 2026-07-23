import { useQueryClient } from '@tanstack/react-query';
import { POKEMON_FILTER } from 'components/Pokemon/types.Pokemon';
import type { NamedAPIResource } from 'pokeapi-js-wrapper';
import { useCallback } from 'react';
import { artworkUrl, cachedImage, preloadImage } from 'utils/cachedImage';
import { idFromUrl } from 'utils/idFromUrl';
import { fetchPokemon, pokemonQueryKey } from './usePokemon';
import { fetchSpecies, speciesQueryKey } from './useSpecies';
import {
  buildTypeIconMap,
  fetchTypeDetails,
  TYPE_DETAILS_KEY
} from './useTypeIconMap';

/**
 * Hook that returns a prefetcher for a slice ("gen") of the Pokémon list.
 * The returned function warms the React Query cache and preloads artwork so a
 * generation appears instantly once selected.
 * @returns An async function that prefetches a slice of Pokémon resources.
 */
export const usePrefetchGen = () => {
  const queryClient = useQueryClient();

  const prefetchOne = useCallback(
    async (poke: NamedAPIResource) => {
      const id = idFromUrl(poke.url);
      if (!id) return;

      const [, species] = await Promise.all([
        queryClient.fetchQuery({
          queryKey: pokemonQueryKey(id),
          queryFn: fetchPokemon
        }),
        queryClient.fetchQuery({
          queryKey: speciesQueryKey(id),
          queryFn: fetchSpecies
        }),
        preloadImage(cachedImage(artworkUrl(id), 100))
      ]);

      await Promise.all(
        species.varieties
          .filter((v) => !v.isDefault && v.id && !POKEMON_FILTER(v.name))
          .map((v) => preloadImage(cachedImage(artworkUrl(v.id!), 100)))
      );
    },
    [queryClient]
  );

  return useCallback(
    async (slice: NamedAPIResource[]) => {
      const typeDetails = await queryClient.fetchQuery({
        queryKey: TYPE_DETAILS_KEY,
        queryFn: fetchTypeDetails,
        staleTime: Infinity
      });

      const typeIconMap = buildTypeIconMap(typeDetails);
      const iconPreloads = Object.values(typeIconMap).map(preloadImage);

      await Promise.all([...iconPreloads, ...slice.map(prefetchOne)]);
    },
    [queryClient, prefetchOne]
  );
};
