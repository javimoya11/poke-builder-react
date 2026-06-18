import Pokemon from 'components/Pokemon/Pokemon';
import { usePokemonList } from 'hooks/usePokemonList';
import usePrefetchGen from 'hooks/usePrefetchGen';
import { useEffect, useState } from 'react';
import { idFromUrl } from 'utils/idFromUrl';
import './List.css';
import pokedexNumbers from './pokedexNumbers.json';

const FIRST_GEN = pokedexNumbers[0];
const LAST_GEN = pokedexNumbers[pokedexNumbers.length - 1];

function List() {
  const [pokemonSearch, setPokemonSearch] = useState('');
  const [genReady, setGenReady] = useState(0);
  const [loadingGen, setLoadingGen] = useState(false);

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
  }, [allPokemons, genReady, prefetchGen]);

  const isInitialLoading = pokeResults.isLoading || genReady === 0;

  if (isInitialLoading) {
    return <h1>Loading...</h1>;
  }

  const filtered = pokemonSearch.length
    ? allPokemons.filter((poke) => poke.name.includes(pokemonSearch.trim()))
    : allPokemons;

  const limit = pokemonSearch.length ? filtered.length : genReady;
  const visible = filtered.slice(0, limit);

  const canLoadMore = !pokemonSearch.length && genReady < LAST_GEN;

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
    <div className="search-list-wrapper">
      <form
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const pokemon = String(formData.get('pokemon-search') ?? '');
          setPokemonSearch(pokemon.replace(' ', '-'));
        }}
      >
        <div className="search-container">
          <input
            id="pokemon-search"
            className="search-input"
            name="pokemon-search"
            type="text"
            placeholder="Enter a Pokémon name..."
          />
          <button className="search-button">Search</button>
        </div>
      </form>

      <div className="pokemon-list">
        {!list.length ? <h1>No Pokémon Found</h1> : list}
      </div>

      {canLoadMore && (
        <button
          className="load-gen-button"
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
}

export default List;
