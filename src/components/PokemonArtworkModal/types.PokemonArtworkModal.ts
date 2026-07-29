export interface IPokemonArtworkModal {
  open: boolean;
  onClose: () => void;
  pokemonId: string | number;
  name: string;
  shiny: boolean;
}
