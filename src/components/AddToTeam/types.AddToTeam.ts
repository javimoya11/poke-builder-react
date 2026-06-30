import { Pokemon } from 'pokeapi-js-wrapper';

export interface IAddToTeam {
  open: boolean;
  onClose: () => void;
  pokemon?: Pokemon;
}
