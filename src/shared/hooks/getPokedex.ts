import { Pokedex } from 'pokeapi-js-wrapper';

const pokedex = new Pokedex({
  protocol: 'https',
  versionPath: '/api/v2/',
  // PokeAPI resource data is immutable, so caching aggressively (IndexedDB,
  // falling back to memory) avoids refetching the same resources across
  // page loads and cuts down on request volume during initial load.
  cache: true,
  cacheImages: false,
  timeout: 10 * 1000 // 10s
});

/**
 * Returns the shared Pokedex client singleton used for all PokeAPI requests.
 * @returns The shared Pokedex instance.
 */
export const getPokedex = (): Pokedex => {
  return pokedex;
};
