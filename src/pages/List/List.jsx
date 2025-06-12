import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import fetchPokemonList from "../../hooks/fetchPokemonList";
import fetchTypesList from "../../hooks/fetchTypesList";
import Pokemon from "../../components/Pokemon/Pokemon";
import pokedexNumbers from "./pokedexNumbers.json";
import "./List.css";

function List() {
  const [pokemonSearch, setPokemonSearch] = useState("");
  const [genNumber, setGenNumber] = useState(pokedexNumbers[0]);
  const pokeResults = useQuery({
    queryKey: ["list"],
    queryFn: fetchPokemonList,
  });
  const typeResults = useQuery({
    queryKey: ["type-list"],
    queryFn: fetchTypesList,
  });
  if (pokeResults.isLoading || typeResults.isLoading) {
    return <h1>Loading...</h1>;
  }
  let pokemons = pokeResults?.data ?? [];
  let pokemonsLength = genNumber || pokedexNumbers[pokedexNumbers.length - 1];
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
      if (pokemon) {
        list.push(
          <Pokemon
            key={pokemon.name}
            id={pokemon.url.match(/(?<=\/pokemon\/)(\d+|\d)/gm)}
            name={pokemon.name}
          />
        );
      }
    }
  }

  return (
    <div className="search-list-wrapper">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target);
          const pokemon = formData.get("pokemon-search") ?? "";
          setPokemonSearch(pokemon.replace(' ', '-'));
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
          <button className="search-button">Search</button>
        </div>
      </form>
      <div className="pokemon-list">
        {!list.length ? <h1>No Pokémon Found</h1> : list}
      </div>
      {!pokemonSearch.length && list.length < pokedexNumbers[pokedexNumbers.length - 1] ? (
        <button
          className="load-gen-button"
          onClick={(e) => {
            e.preventDefault();
            const number = pokedexNumbers.find((element) => element > pokemonsLength);
            setGenNumber(number);
          }}
        >
          Load next gen
        </button>
      ) : (
        <div></div>
      )}
    </div>
  );
}

export default List;
