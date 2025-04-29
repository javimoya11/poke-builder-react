import { useQuery } from "@tanstack/react-query";
import fetchPokemonList from "../../hooks/fetchPokemonList";
import Pokemon from "../../components/Pokemon/Pokemon";
import "./List.css";

function List() {
  const results = useQuery({queryKey: ["list"], queryFn: fetchPokemonList});
  const pokemons = results?.data ?? [];
  pokemons.length = 30;

  return (
    <div className="pokemon-list">
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
