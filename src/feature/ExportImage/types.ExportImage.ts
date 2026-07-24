import type { Team } from '../../shared/hooks/useTeams';

export type ExportMode = 'basic' | 'extended';

export interface IExportImageModal {
  open: boolean;
  onClose: () => void;
  team: Team;
}
