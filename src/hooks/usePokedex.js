import { Pokedex } from 'pokeapi-js-wrapper';

function usePokedex() {
    return new Pokedex({
        protocol: "https",
        versionPath: "/api/v2/",
        cache: true,
        timeout: 5 * 1000, // 5s
        cacheImages: true
      });
};


export default usePokedex;
