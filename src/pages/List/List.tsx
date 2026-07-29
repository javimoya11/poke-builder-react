import { Pokemon } from 'components/Pokemon/Pokemon';
import { Spinner } from 'components/Spinner/Spinner';
import { usePokemonList } from 'hooks/usePokemonList';
import { usePrefetchGen } from 'hooks/usePrefetchGen';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { idFromUrl } from 'utils/idFromUrl';
import { useListStore } from '../../shared/stores/useListStore';
import styles from './List.module.css';
import pokedexNumbers from './pokedexNumbers.json';

const FIRST_GEN = pokedexNumbers[0];
const LAST_GEN = pokedexNumbers[pokedexNumbers.length - 1];

// Inclusive [start, end] pokedex-number range for each generation (1-indexed).
const GEN_RANGES = pokedexNumbers.map((end, i) => ({
  start: i === 0 ? 1 : pokedexNumbers[i - 1] + 1,
  end
}));

export const List = () => {
  const search = useListStore((s) => s.search);
  const setSearch = useListStore((s) => s.setSearch);
  const genReady = useListStore((s) => s.genReady);
  const setGenReady = useListStore((s) => s.setGenReady);
  const selectedGen = useListStore((s) => s.selectedGen);
  const setSelectedGen = useListStore((s) => s.setSelectedGen);
  const setScrollY = useListStore((s) => s.setScrollY);

  const [loadingGen, setLoadingGen] = useState(false);
  const [loadingSelectedGen, setLoadingSelectedGen] = useState(false);
  const restoredRef = useRef(false);

  const pokeResults = usePokemonList();
  const prefetchGen = usePrefetchGen();

  const allPokemons = (pokeResults?.data ?? []).filter(
    (poke) => Number(idFromUrl(poke.url)) <= LAST_GEN
  );

  useEffect(() => {
    if (!allPokemons.length || genReady > 0) return;
    let cancelled = false;

    prefetchGen(allPokemons.slice(0, FIRST_GEN)).then(() => {
      if (!cancelled) setGenReady(FIRST_GEN);
    });

    return () => {
      cancelled = true;
    };
  }, [allPokemons, genReady, prefetchGen, setGenReady]);

  const isInitialLoading = pokeResults.isLoading || genReady === 0;

  useEffect(() => {
    if (!selectedGen || isInitialLoading) return;
    const range = GEN_RANGES[selectedGen - 1];
    const readyNow = useListStore.getState().genReady;
    if (range.end <= readyNow) return;

    let cancelled = false;
    setLoadingSelectedGen(true);
    const toPrefetch = allPokemons.filter((poke) => {
      const id = Number(idFromUrl(poke.url));
      return id > readyNow && id <= range.end;
    });

    prefetchGen(toPrefetch).then(() => {
      if (cancelled) return;
      const latestReady = useListStore.getState().genReady;
      setGenReady(Math.max(latestReady, range.end));
      setLoadingSelectedGen(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGen, isInitialLoading]);

  useLayoutEffect(() => {
    if (isInitialLoading || restoredRef.current) return;
    window.scrollTo(0, useListStore.getState().scrollY);
    restoredRef.current = true;
  }, [isInitialLoading]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!restoredRef.current || ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [setScrollY]);

  if (isInitialLoading) {
    return <Spinner />;
  }

  const query = search.trim().toLowerCase().replaceAll(' ', '-');
  const genRange = selectedGen ? GEN_RANGES[selectedGen - 1] : null;

  const filtered = allPokemons.filter((poke) => {
    if (query.length && !poke.name.includes(query)) return false;
    if (genRange) {
      const id = Number(idFromUrl(poke.url));
      if (id < genRange.start || id > genRange.end) return false;
    }
    return true;
  });

  const limit = query.length || genRange ? filtered.length : genReady;
  const visible = filtered.slice(0, limit);

  const canLoadMore = !query.length && !genRange && genReady < LAST_GEN;

  const loadNextGen = async () => {
    const nextLimit = pokedexNumbers.find((n) => n > genReady) ?? LAST_GEN;

    setLoadingGen(true);
    try {
      await prefetchGen(allPokemons.slice(genReady, nextLimit));
      setGenReady(nextLimit);
    } finally {
      setLoadingGen(false);
    }
  };

  const list = visible.map((pokemon, i) => {
    const id = idFromUrl(pokemon.url);
    return <Pokemon key={pokemon.name} id={id} name={pokemon.name} index={i} />;
  });

  const genOptions = [
    { value: 0, label: 'All' },
    ...GEN_RANGES.map((_, i) => ({ value: i + 1, label: `Gen ${i + 1}` }))
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchContainer}>
        <input
          id="pokemon-search"
          className={styles.searchInput}
          name="pokemon-search"
          type="text"
          placeholder="Enter a Pokémon name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.genFilter}>
        <nav className={styles.genNav} aria-label="Filter by generation">
          {genOptions.map((option) => {
            const isLoadingThis =
              loadingSelectedGen && selectedGen === option.value;
            return (
              <button
                key={option.value}
                type="button"
                className={selectedGen === option.value ? styles.active : ''}
                onClick={() => setSelectedGen(option.value)}
                disabled={isLoadingThis}
              >
                {isLoadingThis ? (
                  <span
                    className="button-spinner"
                    aria-label="Loading generation"
                  />
                ) : (
                  option.label
                )}
              </button>
            );
          })}
        </nav>

        <div className={styles.genSelectWrapper}>
          <select
            className={styles.genSelect}
            aria-label="Filter by generation"
            value={selectedGen}
            disabled={loadingSelectedGen}
            onChange={(e) => setSelectedGen(Number(e.target.value))}
          >
            {genOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {selectedGen !== 0 && (
            <button
              type="button"
              className={styles.clearGenButton}
              aria-label="Clear generation filter"
              onClick={() => setSelectedGen(0)}
            >
              ×
            </button>
          )}
        </div>
      </div>

      <div className={styles.list}>
        {!list.length ? <h1>No Pokémon Found</h1> : list}
      </div>

      {canLoadMore && (
        <button
          className={styles.loadGenButton}
          onClick={loadNextGen}
          disabled={loadingGen}
        >
          {loadingGen ? (
            <span className="button-spinner" aria-label="Loading" />
          ) : (
            'Load next gen'
          )}
        </button>
      )}
    </div>
  );
};
