import usePokedex from "./usePokedex";

async function fetchPokemonList() {
    const pokedex = usePokedex();

    const response = await pokedex.getPokemonsList({
        offset: 0,
        limit: 30,
    });

    if (!response.results)
        throw new Error(`poke search not okay`);
    
    return new Promise((resolve) => {
        resolve(response.results);
    });
}

export default fetchPokemonList;
