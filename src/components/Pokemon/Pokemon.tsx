import { usePokemon } from 'hooks/usePokemon';
import { useSpecies } from 'hooks/useSpecies';
import { useTypeIconMap } from 'hooks/useTypeIconMap';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Variety } from 'types';
import { artworkUrl, cachedImage } from 'utils/cachedImage';
import { prettify } from 'utils/string-utils';
import './Pokemon.css';
import {
  PLACEHOLDER_IMG,
  POKEMON_FILTER,
  type PokemonProps
} from './types.Pokemon';

function Pokemon({ id, name, index }: PokemonProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [formIndex, setFormIndex] = useState(0);
  const [slideDir, setSlideDir] = useState(0);

  const { data: species } = useSpecies(id);
  const forms: Variety[] = species?.varieties.filter(
    (vari) => !POKEMON_FILTER(vari.name)
  ) ?? [{ name, id, isDefault: true }];
  const safeIndex = Math.min(formIndex, forms.length - 1);
  const current: Variety = forms[safeIndex] ?? { name, id, isDefault: true };
  const currentId = current.id ?? id ?? '';
  const hasForms = forms.length > 1;

  const results = usePokemon(currentId);
  const pokemon = results.data;

  const { data: typeIconMap = {} } = useTypeIconMap();
  const typeIcons = pokemon?.types
    ? pokemon.types.map((entry) => ({
        name: entry.type.name,
        icon: typeIconMap[entry.type.url] ?? null
      }))
    : [];

  const ready = imgLoaded && !results.isPending;

  const changeForm = (delta: number) => {
    setImgLoaded(false);
    setSlideDir(delta);
    setFormIndex((i) => (i + delta + forms.length) % forms.length);
  };

  const slideClass =
    slideDir === 0 ? '' : slideDir > 0 ? 'slide-next' : 'slide-prev';

  return (
    <div className="pokemon-card">
      <div
        className={ready ? 'card-skeleton hidden' : 'card-skeleton'}
        aria-hidden="true"
      />
      <Link
        key={currentId}
        className={`card-link ${slideClass}`}
        to={`/details/${currentId}${forms.length > 1 ? '_' + forms.find((f) => f.isDefault)?.id : ''}`}
      >
        <div className="sprite-container">
          <img
            src={cachedImage(artworkUrl(currentId), 100)}
            loading={index < 8 ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={index < 8 ? 'high' : 'low'}
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
