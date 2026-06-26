import { Trash } from 'lucide-react';
import { useState } from 'react';
import { DeleteTeam } from '../DeleteTeam/DeleteTeam';
import { ITeamCard } from './types.TeamCard';

export const TeamCard = ({ team }: ITeamCard) => {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <>
      <div>
        <button onClick={() => setDeleteOpen(true)}>
          <Trash size={16} />
        </button>
        {team.name}
      </div>
      <DeleteTeam
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        team={team}
      />
    </>
  );
};
