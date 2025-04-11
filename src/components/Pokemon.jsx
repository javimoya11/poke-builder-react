import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import fetchPokemon from "../hooks/fetchPokemon";

function Pokemon(props) {
  const { name } = props;

  const results = useQuery({queryKey: ["pokemon", {name}], queryFn: fetchPokemon});
  const pokemon = results?.data ?? {};

  let poke = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";
  if (pokemon.sprites) {
    poke = pokemon.sprites.front_default;
  }

  let typesText = "Normal";
  if (pokemon.types) {
    typesText = pokemon.types.length > 1 ?
     `${pokemon.types[0].type.name} / ${pokemon.types[1].type.name}` : `${pokemon.types[0].type.name}`;
  }

  return (
    <Link to={`/details/${pokemon.id}`} className="pokemon">
      <div className="image-container">
        <img src={poke} alt={name} />
      </div>
      <div className="info">
        <h1>{name}</h1>
        <h2>{`#${pokemon.id} — ${typesText}`}</h2>
      </div>
    </Link>
  );
}

export default Pokemon;