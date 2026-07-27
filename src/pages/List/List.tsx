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

export const List = () => {
  const search = useListStore((s) => s.search);
  const setSearch = useListStore((s) => s.setSearch);
  const genReady = useListStore((s) => s.genReady);
  const setGenReady = useListStore((s) => s.setGenReady);
  const setScrollY = useListStore((s) => s.setScrollY);

  const [loadingGen, setLoadingGen] = useState(false);
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
  const filtered = query.length
    ? allPokemons.filter((poke) => poke.name.includes(query))
    : allPokemons;

  const limit = query.length ? filtered.length : genReady;
  const visible = filtered.slice(0, limit);

  const canLoadMore = !query.length && genReady < LAST_GEN;

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
