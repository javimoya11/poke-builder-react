import { PLACEHOLDER_IMG } from 'components/Pokemon/types.Pokemon';
import { Spinner } from 'components/Spinner/Spinner';
import { Modal } from 'feature/Modal/Modal';
import { useEffect, useState } from 'react';
import { artworkUrl, cachedImage } from 'utils/cachedImage';
import { prettify } from 'utils/string-utils';
import styles from './PokemonArtworkModal.module.css';
import { IPokemonArtworkModal } from './types.PokemonArtworkModal';

export const PokemonArtworkModal = ({
  open,
  onClose,
  pokemonId,
  name,
  shiny
}: IPokemonArtworkModal) => {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFailed(false);
    setLoaded(false);
  }, [open, pokemonId, shiny]);

  return (
    <Modal isOpen={open} onClose={onClose} className={styles.modal}>
      <div className={styles.container}>
        {!loaded && <Spinner />}
        <img
          className={styles.artwork}
          style={{ display: loaded ? 'block' : 'none' }}
          src={
            failed
              ? PLACEHOLDER_IMG
              : cachedImage(artworkUrl(pokemonId, shiny), 400)
          }
          alt={prettify(name)}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setFailed(true);
            setLoaded(true);
          }}
        />
      </div>
    </Modal>
  );
};
