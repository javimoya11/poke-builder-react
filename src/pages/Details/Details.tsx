import { PageView } from 'components/PageView/PageView';
import { Range } from 'components/Range/Range';
import { usePokemon } from 'hooks/usePokemon';
import { useParams } from 'react-router-dom';
import { cachedImage } from 'utils/cachedImage';
import { prettify } from 'utils/string-utils';
import styles from './Details.module.css';

export const Details = () => {
  const { id } = useParams<{ id: string }>();
  const [formId, baseId] = (id ?? '').split('_');

  const results = usePokemon(formId);
  const pokemon = results.data;

  if (results.isLoading || !pokemon) {
    return <h1>Loading...</h1>;
  }

  return (
    <PageView>
      <div className={styles.bio}>
        <div className={styles.data}>
          <h1 className={styles.name}>{`#${baseId ?? formId} - ${prettify(pokemon.name)}`}</h1>
          <div className={styles.stats}>
            <h2>Base Stats</h2>
            {pokemon.stats.map((stat) => {
              return (
                <Range
                  key={stat.stat.name}
                  name={stat.stat.name}
                  range={stat.base_stat}
                />
              );
            })}
          </div>
        </div>
        <img
          src={cachedImage(
            `${pokemon.sprites.other['official-artwork'].front_default}`,
            400
          )}
          alt={pokemon.name}
        />
      </div>
    </PageView>
  );
};
