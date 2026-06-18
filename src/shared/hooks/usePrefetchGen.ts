import { useQueryClient } from '@tanstack/react-query';
import type { NamedAPIResource } from 'pokeapi-js-wrapper';
import { useCallback } from 'react';
import { artworkUrl, cachedImage, preloadImage } from 'utils/cachedImage';
import { idFromUrl } from 'utils/idFromUrl';
import { fetchPokemon, pokemonQueryKey } from './usePokemon';
import { fetchSpecies, speciesQueryKey } from './useSpecies';
import { fetchTypeIconMap, TYPE_ICON_MAP_KEY } from './useTypeIconMap';

/**
 * Hook that returns a prefetcher for a slice ("gen") of the Pokémon list.
 * The returned function warms the React Query cache and preloads artwork so a
 * generation appears instantly once selected.
 * @returns An async function that prefetches a slice of Pokémon resources.
 */
function usePrefetchGen() {
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
      // then shows its image without waiting.
      await Promise.all(
        species.varieties
          .filter((v) => !v.isDefault && v.id)
          .map((v) => preloadImage(cachedImage(artworkUrl(v.id!), 100)))
      );
    },
    [queryClient]
  );

  // Loads the whole slice; resolves only once EVERYTHING is ready.
  return useCallback(
    async (slice: NamedAPIResource[]) => {
      // Type icons are fetched only ONCE (there are just 18). fetchQuery with
      // staleTime: Infinity won't refetch if already cached from a previous slice.
      const typeIconMap = await queryClient.fetchQuery({
        queryKey: TYPE_ICON_MAP_KEY,
        queryFn: fetchTypeIconMap,
        staleTime: Infinity
      });

      const iconPreloads = Object.values(typeIconMap).map(preloadImage);

      await Promise.all([...iconPreloads, ...slice.map(prefetchOne)]);
    },
    [queryClient, prefetchOne]
  );
}

export default usePrefetchGen;
