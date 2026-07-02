import { AddToTeam } from 'components/AddToTeam/AddToTeam';
import { AuthForm } from 'components/AuthForm/AuthForm';
import { Dropdown } from 'feature/Dropdown/Dropdown';
import { usePokemon } from 'hooks/usePokemon';
import { useSpecies } from 'hooks/useSpecies';
import { useTypeIconMap } from 'hooks/useTypeIconMap';
import { ChevronLeft, ChevronRight, MoreVertical, Plus } from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import type { Variety } from 'types';
import { artworkUrl, cachedImage } from 'utils/cachedImage';
import { prettify } from 'utils/string-utils';
import { useGlobalStore } from '../../shared/stores/useGlobalStore';
import styles from './Pokemon.module.css';
import {
  PLACEHOLDER_IMG,
  POKEMON_FILTER,
  type PokemonProps
} from './types.Pokemon';

const hoverMq = window.matchMedia('(hover: hover)');
const subscribeHover = (cb: () => void) => {
  hoverMq.addEventListener('change', cb);
  return () => hoverMq.removeEventListener('change', cb);
};
const getHover = () => hoverMq.matches;

export const Pokemon = ({ id, name, index }: PokemonProps) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [formIndex, setFormIndex] = useState(0);
  const [slideDir, setSlideDir] = useState(0);
  const [authOpen, setAuthOpen] = useState(false);
  const [addTeamOpen, setAddTeamOpen] = useState(false);

  const isHoverDevice = useSyncExternalStore(
    subscribeHover,
    getHover,
    () => true
  );
  const user = useGlobalStore((s) => s.user);

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
    slideDir === 0 ? '' : slideDir > 0 ? styles.slideNext : styles.slidePrev;

  const handleAddToTeam = () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setAddTeamOpen(true);
  };

  const actions = [
    {
      label: 'Add to team',
      icon: <Plus size={16} />,
      callback: handleAddToTeam
    }
  ];

  return (
    <div className={styles.card}>
      <div
        className={`${styles.skeleton} ${ready ? styles.hidden : ''}`}
        aria-hidden="true"
      />
      <Link
        key={currentId}
        className={`${styles.link} ${slideClass}`}
        to={`/details/${currentId}${forms.length > 1 ? '_' + forms.find((f) => f.isDefault)?.id : ''}`}
      >
        <div className={styles.sprite}>
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

        <div className={styles.info}>
          <h2 className={styles.number}>{`#${id}`}</h2>
          <h1 className={styles.name}>{prettify(current.name)}</h1>
          {typeIcons.length > 0 && (
            <div className={styles.type}>
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

      {isHoverDevice ? (
        <div className={styles.actionsDesktop}>
          <button
            type="button"
            className={styles.actionBtn}
            aria-label="Add to team"
            onClick={handleAddToTeam}
          >
            <Plus size={16} />
          </button>
        </div>
      ) : (
        <div className={styles.actionsTouch}>
          <Dropdown
            actions={actions}
            direction="up"
            align="right"
            trigger={({ toggle }) => (
              <button
                type="button"
                className={styles.actionMenuTrigger}
                aria-label="Actions"
                onClick={toggle}
              >
                <MoreVertical size={16} />
              </button>
            )}
          />
        </div>
      )}

      <AuthForm isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      {addTeamOpen && (
        <AddToTeam
          open
          onClose={() => setAddTeamOpen(false)}
          pokemon={pokemon}
        />
      )}

      {hasForms && (
        <>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowLeft}`}
            aria-label="Previous form"
            onClick={() => changeForm(-1)}
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            className={`${styles.arrow} ${styles.arrowRight}`}
            aria-label="Next form"
            onClick={() => changeForm(1)}
          >
            <ChevronRight />
          </button>
        </>
      )}
    </div>
  );
};
