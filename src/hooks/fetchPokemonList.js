import usePokedex from "./usePokedex";

async function fetchPokemonList() {
    const pokedex = usePokedex();

    const response = await pokedex.getPokemonsList({
        offset: 0,
        limit: 1024,
    });

    if (!response.results) {
        throw new Error(`poke search not okay`);
    }

    response.results.forEach((poke) => {
        caches.open("poke-cache").then((cache) => cache.add(poke.url));
    });
    
    return new Promise((resolve) => {
        resolve(response.results);
    });
}

export default fetchPokemonList;
