async function fetchPokemon({queryKey}) {
    const  [_key, { id }]  = queryKey;

    const response = await caches.match(`https://pokeapi.co/api/v2/pokemon/${id}/`);
    
    if (!id || !response.ok) {
        throw new Error(`poke search not okay`);
    }
    
    return new Promise((resolve) => {
        resolve(response.json());
    });
}

export default fetchPokemon;
