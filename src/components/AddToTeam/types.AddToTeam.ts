import { Pokemon } from 'pokeapi-js-wrapper';

export interface IAddToTeam {
  open: boolean;
  onClose: () => void;
  pokemon?: Pokemon;
}

export const STAT_NAMES = [
  'hp',
  'attack',
  'defense',
  'special-attack',
  'special-defense',
  'speed',
] as const;

export type StatName = (typeof STAT_NAMES)[number];

export const EV_FIELD: Record<StatName, keyof IAddToTeamForm> = {
  'hp':              'ev_hp',
  'attack':          'ev_atk',
  'defense':         'ev_def',
  'special-attack':  'ev_spatk',
  'special-defense': 'ev_spdef',
  'speed':           'ev_spd',
};

export const MAX_SINGLE_EV = 255;
export const MAX_TOTAL_EV  = 510;

export const MOVE_SLOTS = ['move_1', 'move_2', 'move_3', 'move_4'] as const;
export type MoveSlot = (typeof MOVE_SLOTS)[number];

export const INITIAL_FORM: IAddToTeamForm = {
  teamId:    '',
  held_item: '',
  ev_hp:     0,
  ev_atk:    0,
  ev_def:    0,
  ev_spatk:  0,
  ev_spdef:  0,
  ev_spd:    0,
  move_1:    '',
  move_2:    '',
  move_3:    '',
  move_4:    '',
  ability:   '',
};

export interface IAddToTeamForm {
  teamId:    string;
  held_item: string;
  ev_hp:     number;
  ev_atk:    number;
  ev_def:    number;
  ev_spatk:  number;
  ev_spdef:  number;
  ev_spd:    number;
  move_1:    string;
  move_2:    string;
  move_3:    string;
  move_4:    string;
  ability:   string;
}

export interface IAddToTeamErrors {
  teamId?:    string;
  ev_hp?:     string;
  ev_atk?:    string;
  ev_def?:    string;
  ev_spatk?:  string;
  ev_spdef?:  string;
  ev_spd?:    string;
  evTotal?:   string;
  moves?:     string;
  ability?:   string;
}

export const MEGA_STONE_MAP: Record<string, string> = {
  'venusaur-mega':   'venusaurite',
  'charizard-mega-x': 'charizardite-x',
  'charizard-mega-y': 'charizardite-y',
  'blastoise-mega':  'blastoisinite',
  'beedrill-mega':   'beedrillite',
  'pidgeot-mega':    'pidgeotite',
  'alakazam-mega':   'alakazite',
  'slowbro-mega':    'slowbronite',
  'gengar-mega':     'gengarite',
  'kangaskhan-mega': 'kangaskhanite',
  'pinsir-mega':     'pinsirite',
  'gyarados-mega':   'gyaradosite',
  'aerodactyl-mega': 'aerodactylite',
  'mewtwo-mega-x':   'mewtwonite-x',
  'mewtwo-mega-y':   'mewtwonite-y',
  'ampharos-mega':   'ampharosite',
  'steelix-mega':    'steelixite',
  'scizor-mega':     'scizorite',
  'heracross-mega':  'heracronite',
  'houndoom-mega':   'houndoominite',
  'tyranitar-mega':  'tyranitarite',
  'sceptile-mega':   'sceptilite',
  'blaziken-mega':   'blazikenite',
  'swampert-mega':   'swampertite',
  'gardevoir-mega':  'gardevoirite',
  'sableye-mega':    'sablenite',
  'mawile-mega':     'mawilite',
  'aggron-mega':     'aggronite',
  'medicham-mega':   'medichamite',
  'manectric-mega':  'manectite',
  'sharpedo-mega':   'sharpedonite',
  'camerupt-mega':   'cameruptite',
  'altaria-mega':    'altarianite',
  'banette-mega':    'banettite',
  'absol-mega':      'absolite',
  'glalie-mega':     'glalitite',
  'salamence-mega':  'salamencite',
  'metagross-mega':  'metagrossite',
  'latias-mega':     'latiasite',
  'latios-mega':     'latiosite',
  'kyogre-primal':   'blue-orb',
  'groudon-primal':  'red-orb',
  'rayquaza-mega':   'dragon-ascent',
  'lopunny-mega':    'lopunnite',
  'garchomp-mega':   'garchompite',
  'lucario-mega':    'lucarionite',
  'abomasnow-mega':  'abomasite',
  'gallade-mega':    'galladite',
  'audino-mega':     'audinite',
  'diancie-mega':    'diancite',
};

export function getForcedItem(pokemonName?: string): string | undefined {
  if (!pokemonName) return undefined;
  return MEGA_STONE_MAP[pokemonName];
}

export function isUnmappedMega(pokemonName?: string): boolean {
  if (!pokemonName) return false;
  const isMegaOrPrimal =
    pokemonName.includes('-mega') || pokemonName.includes('-primal');
  return isMegaOrPrimal && !(pokemonName in MEGA_STONE_MAP);
}
