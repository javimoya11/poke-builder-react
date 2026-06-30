import { Pokedex } from 'pokeapi-js-wrapper';

const pokedex = new Pokedex({
  protocol: 'https',
  versionPath: '/api/v2/',
  cache: false,
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
