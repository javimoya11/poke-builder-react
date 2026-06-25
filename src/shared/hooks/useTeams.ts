import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

export const teamsQueryKey = (userId?: string) =>
  ['teams', { userId }] as const;

async function fetchTeams(userId: string) {
  const { data, error } = await supabase
    .from('teams')
    .select(
      `
      id,
      name,
      created_at,
      team_pokemon (
        slot,
        pokemon_name,
        pokemon_id
      )
    `
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export const useTeams = (userId?: string) =>
  useQuery({
    queryKey: teamsQueryKey(userId),
    queryFn: () => fetchTeams(userId!),
    enabled: !!userId
  });
