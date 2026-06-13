import { useState } from "react";
import { Link } from "react-router-dom";
import "./Pokemon.css";
import { usePokemon } from "../../shared/hooks/usePokemon";
import { useSpecies } from "../../shared/hooks/useSpecies";
import { useTypeIconMap } from "../../shared/hooks/useTypeIconMap";
import { cachedImage, artworkUrl } from "../../shared/utils/cachedImage";
import { PLACEHOLDER_IMG } from "./const.Pokemon";

const prettify = (name) => name.replace(/-/g, " ");

function Pokemon(props) {
  const { id, name, index } = props;

  const [imgLoaded, setImgLoaded] = useState(false);
  const [formIndex, setFormIndex] = useState(0);
  const [slideDir, setSlideDir] = useState(0);

  const { data: species } = useSpecies(id);
  const forms = species?.varieties ?? [{ name, id, isDefault: true }];
  const safeIndex = Math.min(formIndex, forms.length - 1);
  const current = forms[safeIndex] ?? { name, id };
  const hasForms = forms.length > 1;

  const results = usePokemon(current.id);
  const pokemon = results?.data ?? {};

  const { data: typeIconMap = {} } = useTypeIconMap();
  const typeIcons = pokemon.types
    ? pokemon.types.map((entry) => ({
        name: entry.type.name,
        icon: typeIconMap[entry.type.url] ?? null,
      }))
    : [];

  const ready = imgLoaded && !results.isPending;

  const changeForm = (delta) => {
    setImgLoaded(false);
    setSlideDir(delta);
    setFormIndex((i) => (i + delta + forms.length) % forms.length);
  };

  const slideClass =
    slideDir === 0 ? "" : slideDir > 0 ? "slide-next" : "slide-prev";

  return (
    <div className="pokemon-card">
      <div
        className={ready ? "card-skeleton hidden" : "card-skeleton"}
        aria-hidden="true"
      />
      <Link
        key={current.id}
        className={`card-link ${slideClass}`}
        to={`/details/${current.id}`}
      >
        <div className="sprite-container">
          <img
            src={cachedImage(artworkUrl(current.id), 100)}
            loading={index < 8 ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={index < 8 ? "high" : "low"}
            width={100}
            height={100}
            alt={current.name}
            onLoad={() => {
              if (!imgLoaded) setImgLoaded(true);
            }}
            onError={(e) => {
              if (e.currentTarget.src !== PLACEHOLDER_IMG) {
                e.currentTarget.src = PLACEHOLDER_IMG;
              }
              if (!imgLoaded) setImgLoaded(true);
            }}
          />
        </div>

        <div className="info">
          <h2 className="number-text">{`#${id}`}</h2>
          <h1 className="name-text">{prettify(current.name)}</h1>
          {typeIcons.length > 0 && (
            <div className="type-text">
              {typeIcons.map((type) => (
                <img
                  key={type.name}
                  src={type.icon ?? PLACEHOLDER_IMG}
                  alt={type.name}
                />
              ))}
            </div>
          )}
        </div>
      </Link>

      {hasForms && (
        <>
          <button
            type="button"
            className="form-arrow form-arrow-left"
            aria-label="Previous form"
            onClick={() => changeForm(-1)}
          >
            ‹
          </button>
          <button
            type="button"
            className="form-arrow form-arrow-right"
            aria-label="Next form"
            onClick={() => changeForm(1)}
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}

export default Pokemon;
