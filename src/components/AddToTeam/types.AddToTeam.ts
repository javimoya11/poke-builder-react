import { Pokemon } from 'pokeapi-js-wrapper';

export interface IAddToTeam {
  open: boolean;
  onClose: () => void;
  pokemon?: Pokemon;
}

export const MEGA_STONE_MAP: Record<string, string> = {
  'venusaur-mega': 'venusaurite',
  'charizard-mega-x': 'charizardite-x',
  'charizard-mega-y': 'charizardite-y',
  'blastoise-mega': 'blastoisinite',
  'beedrill-mega': 'beedrillite',
  'pidgeot-mega': 'pidgeotite',
  'alakazam-mega': 'alakazite',
  'slowbro-mega': 'slowbronite',
  'gengar-mega': 'gengarite',
  'kangaskhan-mega': 'kangaskhanite',
  'pinsir-mega': 'pinsirite',
  'gyarados-mega': 'gyaradosite',
  'aerodactyl-mega': 'aerodactylite',
  'mewtwo-mega-x': 'mewtwonite-x',
  'mewtwo-mega-y': 'mewtwonite-y',
  'ampharos-mega': 'ampharosite',
  'steelix-mega': 'steelixite',
  'scizor-mega': 'scizorite',
  'heracross-mega': 'heracronite',
  'houndoom-mega': 'houndoominite',
  'tyranitar-mega': 'tyranitarite',
  'sceptile-mega': 'sceptilite',
  'blaziken-mega': 'blazikenite',
  'swampert-mega': 'swampertite',
  'gardevoir-mega': 'gardevoirite',
  'sableye-mega': 'sablenite',
  'mawile-mega': 'mawilite',
  'aggron-mega': 'aggronite',
  'medicham-mega': 'medichamite',
  'manectric-mega': 'manectite',
  'sharpedo-mega': 'sharpedonite',
  'camerupt-mega': 'cameruptite',
  'altaria-mega': 'altarianite',
  'banette-mega': 'banettite',
  'absol-mega': 'absolite',
  'glalie-mega': 'glalitite',
  'salamence-mega': 'salamencite',
  'metagross-mega': 'metagrossite',
  'latias-mega': 'latiasite',
  'latios-mega': 'latiosite',
  'kyogre-primal': 'blue-orb',
  'groudon-primal': 'red-orb',
  'rayquaza-mega': 'dragon-ascent',
  'lopunny-mega': 'lopunnite',
  'garchomp-mega': 'garchompite',
  'lucario-mega': 'lucarionite',
  'abomasnow-mega': 'abomasite',
  'gallade-mega': 'galladite',
  'audino-mega': 'audinite',
  'diancie-mega': 'diancite',
};

export function getForcedItem(pokemonName?: string): string | undefined {
  if (!pokemonName) return undefined;
  return MEGA_STONE_MAP[pokemonName];
}

export function isUnmappedMega(pokemonName?: string): boolean {
  if (!pokemonName) return false;
  const isMegaOrPrimal = pokemonName.includes('-mega') || pokemonName.includes('-primal');
  return isMegaOrPrimal && !(pokemonName in MEGA_STONE_MAP);
}
