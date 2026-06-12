import { Pokedex } from 'pokeapi-js-wrapper';

function usePokedex() {
    return new Pokedex({
        protocol: "https",
        versionPath: "/api/v2/",
        cache: true,
        timeout: 10 * 1000, // 10s
        cacheImages: true
      });
};


export default usePokedex;
