export interface IDeleteTeam {
  open: boolean;
  onClose: () => void;
  team: ITeamToDelete;
}

export interface ITeamToDelete {
  id: number;
  name: string;
}
