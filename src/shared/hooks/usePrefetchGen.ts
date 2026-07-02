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

  // Prefetches a single Pokémon: its base detail, species and artwork.
  const prefetchOne = useCallback(
    async (poke: NamedAPIResource) => {
      const id = idFromUrl(poke.url);
      if (!id) return;

      // Base Pokémon detail, its species and the base artwork, in parallel.
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

      // Preload the alternate forms' artwork (cheap images): selecting a form
      // then shows its image without waiting. Forms hidden by POKEMON_FILTER
      // are skipped since the UI never surfaces them, and many don't have an
      // official-artwork sprite (guaranteed 404s).
      await Promise.all(
        species.varieties
          .filter((v) => !v.isDefault && v.id && !POKEMON_FILTER(v.name))
          .map((v) => preloadImage(cachedImage(artworkUrl(v.id!), 100)))
      );
    },
    [queryClient]
  );

  // Loads the whole slice; resolves only once EVERYTHING is ready.
  return useCallback(
    async (slice: NamedAPIResource[]) => {
      // Type details are fetched only ONCE (there are just 18). fetchQuery with
      // staleTime: Infinity won't refetch if already cached from a previous slice.
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
