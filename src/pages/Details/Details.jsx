import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import fetchPokemon from "../../hooks/fetchPokemon";

function Details() {
  const { id } = useParams();

  const results = useQuery({
    queryKey: ["details", { id }],
    queryFn: fetchPokemon,
  });
  if (results.isLoading) {
    return (
        <h1 >Loading...</h1>
    );
  }
  const pokemon = results?.data ?? {};

  return (
    <div>
      <div className="info">
        <h2 className="number-text">{`#${pokemon.id}`}</h2>
        <h1 className="name-text">{pokemon.name}</h1>
      </div>
    </div>
  );
}

export default Details;
