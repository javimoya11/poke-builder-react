import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import "./Pokemon.css";
import fetchPokemon from "../../shared/hooks/fetchPokemon";

function Pokemon(props) {
  const { id } = props;

  const results = useQuery({
    queryKey: ["pokemon", { id }],
    queryFn: fetchPokemon,
  });
  const pokemon = results?.data ?? {};

  let pokeUrlImg = "";
  let pokeTypesUrl = ["", ""];

  if (pokemon.sprites && pokemon.types) {
    pokeUrlImg = pokemon.sprites.other["official-artwork"].front_default;
    pokeTypesUrl = pokemon.types.map((type) => type.type.url);
  }

  const cachedImages = async ({ queryKey }) => {
    const imgExists = await caches
      .match(queryKey[1].img)
      .finally(() => true)
      .catch(() => false);
    let typesExists = [false, false];
    let typesUrls = [];
    for (const type of queryKey[1].typesImg) {
      typesExists = await caches
        .match(type)
        .finally(() => true)
        .catch(() => false);
        if (typesExists.ok) {
          typesExists = await typesExists.json();
          typesUrls.push(typesExists.sprites['generation-viii']['brilliant-diamond-and-shining-pearl']['name_icon']);
        }
    }
    return imgExists && typesUrls[0] instanceof String
      ? [caches.match(queryKey[1].img), typesUrls]
      : [queryKey[1].img, typesUrls];
  };

  const images = useQuery({
    queryKey: ["images", { img: pokeUrlImg, typesImg: pokeTypesUrl }],
    queryFn: cachedImages,
  });
  const imageUrl = () => {
    let path = images.data;
    if (images?.data) {
      return path;
    }
    return [
      "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png",
      ["https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png"],
    ];
  };

  let typesImage = [
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png",
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png",
  ];
  if (pokemon.types) {
    typesImage = imageUrl()[1];
    typesImage =
      pokemon.types.length > 1 ? (
        <div className="type-text">
          <img src={imageUrl()[1][0]} alt={pokemon.types[0].type.name} />
          <img src={imageUrl()[1][1]} alt={pokemon.types[1].type.name} />
        </div>
      ) : (
        <div className="type-text">
          <img src={imageUrl()[1][0]} alt={pokemon.types[0].type.name} />
        </div>
      );
  }

  let card = undefined;

  if (pokemon.id) {
    card = (
      <Link to={`/details/${pokemon.id}`}>
        <div className="pokemon-card">
          <div className="sprite-container">
            <img src={imageUrl()[0]} alt={pokemon.name} />
          </div>
          <div className="info">
            <h2 className="number-text">{`#${pokemon.id}`}</h2>
            <h1 className="name-text">{pokemon.name.replace('-', ' ')}</h1>
            {typesImage}
          </div>
        </div>
      </Link>
    );
  } else {
    card = <div></div>;
  }

  return card;
}

export default Pokemon;
