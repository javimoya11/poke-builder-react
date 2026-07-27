import { Modal } from 'feature/Modal/Modal';
import { cachedImage, spriteUrl } from 'utils/cachedImage';
import styles from './ExportShowdown.module.css';
import { showdownStringFormat } from './showdownExport.utils';
import { IExportShowdownModal } from './types.ExportShowdown';

export const ExportShowdownModal = ({
  open,
  onClose,
  team
}: IExportShowdownModal) => {
  return (
    <Modal isOpen={open} onClose={onClose} maxWidth={1200}>
      <div className={styles.modalContent}>
        <div className={styles.pokemonInputs}>
          {team.team_pokemon.map((poke) => {
            return (
              <div key={poke.id} className={styles.pokemonInfo}>
                <div className={styles.pokemonMain}>
                  <img
                    className={styles.pokemonSprite}
                    src={cachedImage(
                      spriteUrl(poke.pokemon_id, poke.shiny),
                      96
                    )}
                    alt=""
                  />
                  <pre className={styles.pokemonText}>
                    {showdownStringFormat(poke)}
                  </pre>
                </div>
                <button className={styles.copyPokemonButton}>
                  Copy Pokémon
                </button>
              </div>
            );
          })}
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.copyButton}>Copy team</button>
        </div>
      </div>
    </Modal>
  );
};
