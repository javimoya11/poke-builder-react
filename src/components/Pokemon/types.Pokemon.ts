export interface PokemonProps {
  id?: string;
  name: string;
  index: number;
}

export const PLACEHOLDER_IMG =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';

export const POKEMON_FILTER = (name: string): boolean =>
  name.includes('-cap') ||
  name.includes('-totem') ||
  name.includes('-own-tempo') ||
  name.includes('-power-construct') ||
  name.includes('-zen') ||
  name.includes('-super') ||
  name.includes('-small') ||
  name.includes('-large') ||
  name.includes('-meteor') ||
  name.includes('-busted') ||
  name.includes('-original') ||
  name.includes('-low-key-gmax') ||
  name.includes('-curly-mega') ||
  name.includes('-droopy-mega') ||
  name.includes('-build') ||
  name.includes('-mode');
