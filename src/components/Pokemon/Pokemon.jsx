import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import "./Pokemon.css";
import fetchPokemon from "../../hooks/fetchPokemon";

function Pokemon(props) {
  const { name } = props;

  const results = useQuery({
    queryKey: ["pokemon", { name }],
    queryFn: fetchPokemon,
  });
  const pokemon = results?.data ?? {};

  let poke = "";
  
  if (pokemon.sprites) {
    poke = pokemon.sprites.other["official-artwork"].front_default;
  }

  const cachedImg = async ({ queryKey }) => {
    const imgExists = await caches.match(queryKey[1].img).finally(() => true).catch(() => false);
    return imgExists ? caches.match(queryKey[1].img) : queryKey[1].img;
  }

  const image = useQuery({
    queryKey: ["image", { img: poke }],
    queryFn: cachedImg,
  });
  const imageUrl = () => {
    let path = image.data;
    if (image?.data) {
      return path.url ?? path;
    }
    return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";
  }

  let typesText = "Normal";
  if (pokemon.types) {
    typesText =
      pokemon.types.length > 1
        ? `${pokemon.types[0].type.name} / ${pokemon.types[1].type.name}`
        : `${pokemon.types[0].type.name}`;
  }

  return (
    <Link to={`/details/${pokemon.id}`}>
      <div className="pokemon-card">
        <div className="sprite-container">
          <img src={imageUrl()} alt={name} />
        </div>
        <div className="info">
          <h2>{`#${pokemon.id}`}</h2>
          <h1>{name}</h1>
          <h2>{typesText}</h2>
        </div>
      </div>
    </Link>
  );
}

export default Pokemon;
