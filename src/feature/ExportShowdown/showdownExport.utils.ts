import { TeamPokemon } from 'hooks/useTeams';
import { prettify } from 'utils/string-utils';

const EV_LABELS: Record<string, string> = {
  ev_hp: 'HP',
  ev_atk: 'Atk',
  ev_def: 'Def',
  ev_spatk: 'SpA',
  ev_spdef: 'SpD',
  ev_spd: 'Spe'
};

const IV_LABELS: Record<string, string> = {
  iv_hp: 'HP',
  iv_atk: 'Atk',
  iv_def: 'Def',
  iv_spatk: 'SpA',
  iv_spdef: 'SpD',
  iv_spd: 'Spe'
};

export const showdownStringFormat = (poke: TeamPokemon) => {
  const lines: string[] = [];

  const name = poke.nickname
    ? `${poke.nickname} (${prettify(poke.pokemon_name)})`
    : prettify(poke.pokemon_name);
  const genderTag =
    poke.gender && poke.gender !== 'genderless'
      ? ` (${poke.gender === 'male' ? 'M' : 'F'})`
      : '';
  const itemTag = poke.held_item ? ` @ ${prettify(poke.held_item)}` : '';
  lines.push(`${name}${genderTag}${itemTag}`);

  lines.push(`Ability: ${prettify(poke.ability)}`);

  if (poke.shiny) {
    lines.push('Shiny: Yes');
  }

  if (poke.tera_type) {
    lines.push(`Tera Type: ${prettify(poke.tera_type)}`);
  }

  const evs = (Object.keys(EV_LABELS) as (keyof typeof EV_LABELS)[])
    .filter((key) => poke[key as keyof TeamPokemon])
    .map((key) => `${poke[key as keyof TeamPokemon]} ${EV_LABELS[key]}`);
  if (evs.length > 0) {
    lines.push(`EVs: ${evs.join(' / ')}`);
  }

  lines.push(`${prettify(poke.nature)} Nature`);

  const ivs = (Object.keys(IV_LABELS) as (keyof typeof IV_LABELS)[])
    .filter((key) => poke[key as keyof TeamPokemon] !== 31)
    .map((key) => `${poke[key as keyof TeamPokemon]} ${IV_LABELS[key]}`);
  if (ivs.length > 0) {
    lines.push(`IVs: ${ivs.join(' / ')}`);
  }

  const moves = [poke.move_1, poke.move_2, poke.move_3, poke.move_4].filter(
    (move): move is string => Boolean(move)
  );
  moves.forEach((move) => lines.push(`- ${prettify(move)}`));

  return lines.join('\n');
};
