import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import fetchPokemon from "../../shared/hooks/fetchPokemon";
import Range from "../../components/Range/Range";
import {cachedImage} from "../../shared/utils/cachedImage"
import "./Details.css";

function Details() {
  const { id } = useParams();

  const results = useQuery({
    queryKey: ["details", { id }],
    queryFn: fetchPokemon,
  });
  if (results.isLoading) {
    return <h1>Loading...</h1>;
  }
  const pokemon = results?.data ?? {};

  return (
    <div className="details-container">
      <div className="bio-container">
        <div className="data-container">
          <h2 className="number-text">{`#${pokemon.id}`}</h2>
          <h1 className="name-text">{pokemon.name.replace('-', ' ')}</h1>
          <div className="stats-container">
            <h2>Base Stats</h2>
            {pokemon.stats.map((stat) => {
              return <Range key={stat.stat.name} name={stat.stat.name} range={stat.base_stat} />;
            })}
          </div>
        </div>
        <img
          src={cachedImage(`${pokemon.sprites.other["official-artwork"].front_default}`, 400)}
          alt={pokemon.name}
        />
      </div>
    </div>
  );
}

export default Details;
