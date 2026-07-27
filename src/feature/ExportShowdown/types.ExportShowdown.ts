import { Team } from 'hooks/useTeams';

export interface IExportShowdownModal {
  open: boolean;
  onClose: () => void;
  team: Team;
}
