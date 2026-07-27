import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

export const teamsQueryKey = (userId?: string) =>
  ['teams', { userId }] as const;

/** A stored team_pokemon row, with every field needed to edit it. */
export interface TeamPokemon {
  id: number;
  slot: number;
  pokemon_name: string;
  pokemon_id: string;
  nickname: string | null;
  held_item: string | null;
  ability: string;
  nature: string;
  level: number;
  gender: string | null;
  shiny: boolean;
  happiness: number;
  tera_type: string | null;
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
  move_1: string | null;
  move_2: string | null;
  move_3: string | null;
  move_4: string | null;
}

export interface Team {
  id: number;
  name: string;
  created_at: string;
  team_pokemon: TeamPokemon[];
}

const TEAM_POKEMON_COLUMNS = `
  id,
  slot,
  pokemon_name,
  pokemon_id,
  nickname,
  held_item,
  ability,
  nature,
  level,
  gender,
  shiny,
  happiness,
  tera_type,
  ev_hp, ev_atk, ev_def, ev_spatk, ev_spdef, ev_spd,
  iv_hp, iv_atk, iv_def, iv_spatk, iv_spdef, iv_spd,
  move_1, move_2, move_3, move_4
`;

async function fetchTeams(userId: string): Promise<Team[]> {
  const { data, error } = await supabase
    .from('teams')
    .select(
      `
      id,
      name,
      created_at,
      team_pokemon (${TEAM_POKEMON_COLUMNS})
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Team[];
}

export const useTeams = (userId?: string) =>
  useQuery({
    queryKey: teamsQueryKey(userId),
    queryFn: () => fetchTeams(userId!),
    enabled: !!userId
  });
