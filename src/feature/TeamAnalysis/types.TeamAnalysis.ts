import type { Team, TeamPokemon } from 'hooks/useTeams';

export interface ITeamAnalysisModal {
  open: boolean;
  onClose: () => void;
  team: Team;
  /** Opens the edit form for one of the team's Pokémon. */
  onEditPokemon: (poke: TeamPokemon) => void;
  /** Starts the add-Pokémon flow; omitted when the team is full or read-only. */
  onAddPokemon?: () => void;
}
