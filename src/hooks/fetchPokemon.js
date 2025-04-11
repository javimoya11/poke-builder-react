import usePokedex from "./usePokedex";

async function fetchPokemon({queryKey}) {
    const pokedex = usePokedex();

    const  [_key, { name }]  = queryKey;

    const response = await pokedex.getPokemonByName(name);
    
    if (!Object.keys(response).length) {
        throw new Error(`poke search not okay`);
    }
    
    return new Promise((resolve) => {
        resolve(response);
    });
}

export default fetchPokemon;
