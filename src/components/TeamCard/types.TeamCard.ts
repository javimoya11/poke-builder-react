export interface ITeamCard {
  team: ITeam;
}

interface ITeam {
  id: number;
  name: string;
  created_at: string;
  team_pokemon: ITeamedPokemon[];
}

interface ITeamedPokemon {
  slot: number;
  pokemon_name: string;
  pokemon_id: string;
}
