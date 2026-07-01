import { Pokemon } from 'pokeapi-js-wrapper';
import type { TeamPokemon } from '../../shared/hooks/useTeams';

export interface IAddToTeam {
  open: boolean;
  onClose: () => void;
  /** The Pokémon to add. Used in create mode (adding a new Pokémon to a team). */
  pokemon?: Pokemon;
  /**
   * A stored team_pokemon row to edit. When present the form runs in edit mode:
   * it loads its Pokémon from `pokemon_id`, pre-fills every field, locks the
   * team selector and updates (rather than inserts) the row on submit.
   */
  editing?: TeamPokemon;
  /** The team id the edited Pokémon belongs to (edit mode only). */
  teamId?: string;
}

export const STAT_NAMES = [
  'hp',
  'attack',
  'defense',
  'special-attack',
  'special-defense',
  'speed'
] as const;

export type StatName = (typeof STAT_NAMES)[number];

export const EV_FIELD: Record<StatName, keyof IAddToTeamForm> = {
  hp: 'ev_hp',
  attack: 'ev_atk',
  defense: 'ev_def',
  'special-attack': 'ev_spatk',
  'special-defense': 'ev_spdef',
  speed: 'ev_spd'
};

export const IV_FIELD: Record<StatName, keyof IAddToTeamForm> = {
  hp: 'iv_hp',
  attack: 'iv_atk',
  defense: 'iv_def',
  'special-attack': 'iv_spatk',
  'special-defense': 'iv_spdef',
  speed: 'iv_spd'
};

export const MAX_SINGLE_EV = 255;
export const MAX_TOTAL_EV = 510;
export const MAX_IV = 31;
export const MIN_LEVEL = 1;
export const MAX_LEVEL = 100;
export const DEFAULT_LEVEL = 50;
export const MAX_HAPPINESS = 255;

export const GENDERS = ['male', 'female', 'genderless'] as const;
export type Gender = (typeof GENDERS)[number];

export const TERA_TYPES = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy'
] as const;
export type TeraType = (typeof TERA_TYPES)[number];

export const MOVE_SLOTS = ['move_1', 'move_2', 'move_3', 'move_4'] as const;
export type MoveSlot = (typeof MOVE_SLOTS)[number];

export const NATURE_STAT: Record<string, StatName> = {
  attack: 'attack',
  defense: 'defense',
  'special-attack': 'special-attack',
  'special-defense': 'special-defense',
  speed: 'speed'
};

export const INITIAL_FORM: IAddToTeamForm = {
  teamId: '',
  nickname: '',
  held_item: '',
  ability: '',
  nature: '',
  level: DEFAULT_LEVEL,
  gender: '',
  shiny: false,
  happiness: MAX_HAPPINESS,
  tera_type: '',
  ev_hp: 0,
  ev_atk: 0,
  ev_def: 0,
  ev_spatk: 0,
  ev_spdef: 0,
  ev_spd: 0,
  iv_hp: MAX_IV,
  iv_atk: MAX_IV,
  iv_def: MAX_IV,
  iv_spatk: MAX_IV,
  iv_spdef: MAX_IV,
  iv_spd: MAX_IV,
  move_1: '',
  move_2: '',
  move_3: '',
  move_4: ''
};

export interface IAddToTeamForm {
  teamId: string;
  nickname: string;
  held_item: string;
  ability: string;
  nature: string;
  level: number;
  gender: '' | Gender;
  shiny: boolean;
  happiness: number;
  tera_type: '' | TeraType;
  ev_hp: number;
  ev_atk: number;
  ev_def: number;
  ev_spatk: number;
  ev_spdef: number;
  ev_spd: number;
  iv_hp: number;
  iv_atk: number;
  iv_def: number;
  iv_spatk: number;
  iv_spdef: number;
  iv_spd: number;
  move_1: string;
  move_2: string;
  move_3: string;
  move_4: string;
}

export interface IAddToTeamErrors {
  teamId?: string;
  nickname?: string;
  level?: string;
  happiness?: string;
  ev_hp?: string;
  ev_atk?: string;
  ev_def?: string;
  ev_spatk?: string;
  ev_spdef?: string;
  ev_spd?: string;
  evTotal?: string;
  iv_hp?: string;
  iv_atk?: string;
  iv_def?: string;
  iv_spatk?: string;
  iv_spdef?: string;
  iv_spd?: string;
  moves?: string;
  ability?: string;
  nature?: string;
}

/**
 * Builds a form state from a stored team_pokemon row (edit mode). Nullable
 * columns become empty strings so the controlled inputs stay defined.
 * @param p - The stored row.
 * @param teamId - The team the row belongs to.
 */
export const formFromTeamPokemon = (
  p: TeamPokemon,
  teamId: string
): IAddToTeamForm => ({
  teamId,
  nickname: p.nickname ?? '',
  held_item: p.held_item ?? '',
  ability: p.ability,
  nature: p.nature ?? '',
  level: p.level,
  gender: (p.gender ?? '') as IAddToTeamForm['gender'],
  shiny: p.shiny,
  happiness: p.happiness,
  tera_type: (p.tera_type ?? '') as IAddToTeamForm['tera_type'],
  ev_hp: p.ev_hp,
  ev_atk: p.ev_atk,
  ev_def: p.ev_def,
  ev_spatk: p.ev_spatk,
  ev_spdef: p.ev_spdef,
  ev_spd: p.ev_spd,
  iv_hp: p.iv_hp,
  iv_atk: p.iv_atk,
  iv_def: p.iv_def,
  iv_spatk: p.iv_spatk,
  iv_spdef: p.iv_spdef,
  iv_spd: p.iv_spd,
  move_1: p.move_1 ?? '',
  move_2: p.move_2 ?? '',
  move_3: p.move_3 ?? '',
  move_4: p.move_4 ?? ''
});

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
  'diancie-mega': 'diancite'
};

export function getForcedItem(pokemonName?: string): string | undefined {
  if (!pokemonName) return undefined;
  return MEGA_STONE_MAP[pokemonName];
}

/**
 * Whether a form name is a Mega or Primal form. These are transient
 * battle forms: Showdown stores the base species holding the corresponding
 * stone/orb, never the mega/primal form itself.
 */
export function isMegaOrPrimal(pokemonName?: string): boolean {
  if (!pokemonName) return false;
  return pokemonName.includes('-mega') || pokemonName.includes('-primal');
}

export function isUnmappedMega(pokemonName?: string): boolean {
  return isMegaOrPrimal(pokemonName) && !(pokemonName! in MEGA_STONE_MAP);
}
