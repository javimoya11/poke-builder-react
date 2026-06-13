import { Pokedex } from 'pokeapi-js-wrapper';

const pokedex = new Pokedex({
  protocol: "https",
  versionPath: "/api/v2/",
  cache: false,
  cacheImages: false,
  timeout: 10 * 1000, // 10s
});

function usePokedex() {
  return pokedex;
}

export default usePokedex;
