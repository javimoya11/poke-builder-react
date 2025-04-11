import { useQuery } from "@tanstack/react-query";
import fetchPokemonList from "../hooks/fetchPokemonList";
import Pokemon from "../components/Pokemon";

function List() {
  const results = useQuery({queryKey: ["list"], queryFn: fetchPokemonList});
  const pokemons = results?.data ?? [];

  return (
    <div>
      {!pokemons.length ? (
        <h1>No Pokemons Found</h1>
      ) : (pokemons.map((pokemon) => {
        return (
          <Pokemon
            key={pokemon.name}
            name={pokemon.name}
          />
        )
      }))}
    </div>
  );
}

export default List;
