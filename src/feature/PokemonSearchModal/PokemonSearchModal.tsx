import { POKEMON_FILTER } from 'components/Pokemon/types.Pokemon';
import { Modal } from 'feature/Modal/Modal';
import { usePokemon } from 'hooks/usePokemon';
import { usePokemonList } from 'hooks/usePokemonList';
import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { createPortal } from 'react-dom';
import { cachedImage, spriteUrl } from 'utils/cachedImage';
import { idFromUrl } from 'utils/idFromUrl';
import { prettify } from 'utils/string-utils';
import styles from './PokemonSearchModal.module.css';
import { IPokemonSearchModal, MAX_SUGGESTIONS } from './types.PokemonSearchModal';

export const PokemonSearchModal = ({
  open,
  onClose,
  onAccept
}: IPokemonSearchModal) => {
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [confirmedName, setConfirmedName] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const comboBoxRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  const { data: allPokemons = [] } = usePokemonList();

  useEffect(() => {
    if (!open) return;
    setSearch('');
    setActiveIndex(-1);
    setSuggestionsOpen(false);
    setConfirmedName(null);
    setNotFound(false);
  }, [open]);

  const query = search.trim().toLowerCase().replaceAll(' ', '-');
  const suggestions = useMemo(() => {
    if (!query.length) return [];
    return allPokemons
      .filter((poke) => !POKEMON_FILTER(poke.name) && poke.name.includes(query))
      .slice(0, MAX_SUGGESTIONS);
  }, [allPokemons, query]);

  const { data: resolvedPokemon, isFetching: resolving } = usePokemon(
    confirmedName ?? undefined,
    { enabled: !!confirmedName, retry: false }
  );

  useEffect(() => {
    if (resolvedPokemon) onAccept(resolvedPokemon);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedPokemon]);

  useEffect(() => {
    if (confirmedName && !resolving && !resolvedPokemon) setNotFound(true);
  }, [confirmedName, resolving, resolvedPokemon]);

  const showSuggestions = suggestionsOpen && suggestions.length > 0;

  const positionSuggestions = () => {
    const combo = comboBoxRef.current;
    if (!combo) return;
    const rect = combo.getBoundingClientRect();
    setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width });
  };

  useLayoutEffect(() => {
    if (!showSuggestions) return;
    positionSuggestions();
  }, [showSuggestions]);

  useEffect(() => {
    if (!showSuggestions) return;
    const onReflow = () => positionSuggestions();
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (comboBoxRef.current?.contains(target)) return;
      if (suggestionsRef.current?.contains(target)) return;
      setSuggestionsOpen(false);
      setActiveIndex(-1);
    };
    window.addEventListener('resize', onReflow);
    window.addEventListener('scroll', onReflow, true);
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      window.removeEventListener('resize', onReflow);
      window.removeEventListener('scroll', onReflow, true);
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, [showSuggestions]);

  const pickSuggestion = (name: string) => {
    setSearch(prettify(name));
    setSuggestionsOpen(false);
    setActiveIndex(-1);
    setConfirmedName(name);
    setNotFound(false);
  };

  const acceptTyped = () => {
    if (!query.length) return;
    const exact =
      allPokemons.find((poke) => poke.name === query) ??
      (suggestions.length ? suggestions[0] : undefined);
    if (!exact) {
      setNotFound(true);
      return;
    }
    pickSuggestion(exact.name);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestionsOpen || !suggestions.length) {
      if (e.key === 'Enter') {
        e.preventDefault();
        acceptTyped();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const chosen = activeIndex >= 0 ? suggestions[activeIndex] : suggestions[0];
      if (chosen) pickSuggestion(chosen.name);
      else acceptTyped();
    } else if (e.key === 'Escape') {
      if (suggestionsOpen) {
        e.stopPropagation();
        setSuggestionsOpen(false);
        setActiveIndex(-1);
      }
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} className={styles.modal}>
      <div className={styles.wrapper}>
        <h2>Add a Pokémon</h2>

        <div className={styles.searchRow}>
          <div className={styles.comboBox} ref={comboBoxRef}>
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded={suggestionsOpen && suggestions.length > 0}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={
                activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
              }
              placeholder="Enter a Pokémon name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSuggestionsOpen(true);
                setActiveIndex(-1);
                setConfirmedName(null);
                setNotFound(false);
              }}
              onFocus={() => setSuggestionsOpen(true)}
              onKeyDown={onKeyDown}
              autoComplete="off"
            />
            {showSuggestions &&
              createPortal(
                <ul
                  ref={suggestionsRef}
                  id={listboxId}
                  role="listbox"
                  className={styles.suggestions}
                  style={{
                    top: coords?.top ?? 0,
                    left: coords?.left ?? 0,
                    width: coords?.width ?? undefined,
                    visibility: coords ? 'visible' : 'hidden'
                  }}
                >
                  {suggestions.map((poke, i) => {
                    const id = idFromUrl(poke.url);
                    return (
                      <li
                        id={`${listboxId}-option-${i}`}
                        key={poke.name}
                        role="option"
                        aria-selected={i === activeIndex}
                        className={`${styles.suggestion} ${i === activeIndex ? styles.suggestionActive : ''}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          pickSuggestion(poke.name);
                        }}
                        onMouseEnter={() => setActiveIndex(i)}
                      >
                        <img
                          src={id ? cachedImage(spriteUrl(id), 64) : undefined}
                          alt=""
                          className={styles.suggestionSprite}
                        />
                        <span className={styles.suggestionNumber}>
                          #{id ?? '???'}
                        </span>
                        <span className={styles.suggestionName}>
                          {prettify(poke.name)}
                        </span>
                      </li>
                    );
                  })}
                </ul>,
                document.body
              )}
          </div>

          <button
            type="button"
            className={styles.acceptButton}
            onClick={acceptTyped}
            disabled={!query.length || resolving}
          >
            {resolving ? (
              <span className="button-spinner" aria-label="Loading" />
            ) : (
              'Accept'
            )}
          </button>
        </div>

        {notFound && (
          <span className={styles.error}>No Pokémon found with that name.</span>
        )}
      </div>
    </Modal>
  );
};
