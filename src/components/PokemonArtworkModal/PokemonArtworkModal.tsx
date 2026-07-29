import { PLACEHOLDER_IMG } from 'components/Pokemon/types.Pokemon';
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

  useEffect(() => {
    if (open) setFailed(false);
  }, [open, pokemonId, shiny]);

  return (
    <Modal isOpen={open} onClose={onClose} className={styles.modal}>
      <div className={styles.container}>
        <img
          className={styles.artwork}
          src={
            failed
              ? PLACEHOLDER_IMG
              : cachedImage(artworkUrl(pokemonId, shiny), 400)
          }
          alt={prettify(name)}
          onError={() => setFailed(true)}
        />
      </div>
    </Modal>
  );
};
