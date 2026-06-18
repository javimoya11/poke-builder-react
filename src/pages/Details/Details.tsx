import { useNavigate, useParams } from "react-router-dom";
import { usePokemon } from "hooks/usePokemon";
import Range from "components/Range/Range";
import { cachedImage } from "utils/cachedImage";
import { prettify } from "utils/string-utils";
import "./Details.css";

function Details() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate()
  const [formId, baseId] = (id ?? "").split('_')

  const results = usePokemon(formId);
  const pokemon = results.data;

  if (results.isLoading || !pokemon) {
    return <h1>Loading...</h1>;
  }

  return (
    <div className="details-container">
      <button
        className="back-button"
        type="button"
        onClick={
          () => {
            navigate('/')
          }
        }
      >
        Exit
      </button>
      <div className="bio-container">
        <div className="data-container">
          <h1 className="name-text">{`#${baseId ?? formId} - ${prettify(pokemon.name)}`}</h1>
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
