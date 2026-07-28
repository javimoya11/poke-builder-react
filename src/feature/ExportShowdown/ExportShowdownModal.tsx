import { Modal } from 'feature/Modal/Modal';
import { useState } from 'react';
import { cachedImage, spriteUrl } from 'utils/cachedImage';
import styles from './ExportShowdown.module.css';
import { showdownStringFormat } from './showdownExport.utils';
import { IExportShowdownModal } from './types.ExportShowdown';

export const ExportShowdownModal = ({
  open,
  onClose,
  team
}: IExportShowdownModal) => {
  const [copied, setCopied] = useState<number | 'team' | null>(null);

  const handleCopyPokemon = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1000);
  };
  const handleCopyTeam = () => {
    const teamCopy = team.team_pokemon.map(showdownStringFormat);
    navigator.clipboard.writeText(teamCopy.join('\n\n'));
    setCopied('team');
    setTimeout(() => setCopied(null), 1000);
  };
  return (
    <Modal isOpen={open} onClose={onClose} className={styles.modal}>
      <div className={styles.modalContent}>
        <h2 className={styles.title}>{team.name}</h2>
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
                <div className={styles.copyButtonWrapper}>
                  {copied === poke.id && (
                    <span className={styles.copiedToast}>Copied!</span>
                  )}
                  <button
                    className={styles.copyPokemonButton}
                    onClick={() =>
                      handleCopyPokemon(poke.id, showdownStringFormat(poke))
                    }
                  >
                    Copy Pokémon
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        <div className={styles.copyButtonWrapper}>
          {copied === 'team' && (
            <span className={styles.copiedToast}>Copied!</span>
          )}
          <button className={styles.copyTeamButton} onClick={handleCopyTeam}>
            Copy team
          </button>
        </div>
      </div>
    </Modal>
  );
};
