import usePokedex from "./usePokedex";

async function fetchTypesList() {
    const pokedex = usePokedex();

    const response = await pokedex.getTypesList({
        offset: 0,
        limit: 18,
    });

    if (!response.results){
        throw new Error(`poke search not okay`);
    }
    
    return new Promise((resolve) => {
        resolve(response.results);
    });
}

export default fetchTypesList;
