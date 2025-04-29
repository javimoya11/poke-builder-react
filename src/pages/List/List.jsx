import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import fetchPokemonList from "../../hooks/fetchPokemonList";
import Pokemon from "../../components/Pokemon/Pokemon";
import "./List.css";

function List() {
  const [pokemonSearch, setPokemonSearch] = useState("");
  const results = useQuery({ queryKey: ["list"], queryFn: fetchPokemonList });
  let pokemons = results?.data ?? [];
  let pokemonsLength = 30;
  if (pokemonSearch.length) {
    pokemons = pokemons.filter((poke) => {
      return poke.name.includes(pokemonSearch.trim());
    });
    pokemonsLength = pokemons.length;
  }

  const list = [];
  if (pokemonsLength) {
    for (let i = 0; i < pokemonsLength; i++) {
      const pokemon = pokemons[i];
      if (pokemon) list.push(<Pokemon key={pokemon.name} name={pokemon.name} />);
    }
  }

  return (
    <div className="search-list-wrapper">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const pokemon = formData.get("pokemon-search") ?? "";
          setPokemonSearch(pokemon);
        }}
      >
        <div className="search-container">
          <input
            id="pokemon-search"
            className="search-input"
            name="pokemon-search"
            type="text"
            placeholder="Enter a Pokémon name..."
          />
          <button type="" className="search-button">
            Search
          </button>
        </div>
      </form>
      <div className="pokemon-list">
        {!list.length ? <h1>No Pokemons Found</h1> : list}
      </div>
    </div>
  );
}

export default List;
