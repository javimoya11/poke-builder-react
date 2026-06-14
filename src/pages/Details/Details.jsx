import { useNavigate, useParams } from "react-router-dom";
import { usePokemon } from "../../shared/hooks/usePokemon";
import Range from "../../components/Range/Range";
import {cachedImage} from "../../shared/utils/cachedImage"
import "./Details.css";

function Details() {
  const { id } = useParams();
  const navigate = useNavigate()
  const [formId, baseId] = id.split('_')

  const results = usePokemon(formId);
  

  const pokemon = results?.data ?? {};

  return !results.isLoading ? (
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
          <h1 className="name-text">{`#${baseId ?? formId} - ${pokemon.name.replace('-', ' ')}`}</h1>
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
  ): (<h1>Loading...</h1>);
}

export default Details;
