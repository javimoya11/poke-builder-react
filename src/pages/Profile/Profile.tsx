import { NewTeam } from 'components/NewTeam/NewTeam';
import PageView from 'components/PageView/PageView';
import { TeamCard } from 'components/TeamCard/TeamCard';
import { useTeams } from 'hooks/useTeams';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalStore } from '../../shared/stores/useGlobalStore';
import styles from './Profile.module.css';

export const Profile = () => {
  const navigate = useNavigate();
  const { user } = useGlobalStore();
  const [openTeam, setOpenTeam] = useState(false);
  const [newTeam, setNewTeam] = useState(false);
  const { data: teams, isLoading } = useTeams(user?.id);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  });

  return user ? (
    <>
      <PageView>
        <div className={styles.profileBody}>
          <div className={styles.teamsContainer}>
            <h2>Teams</h2>
            <button
              className={styles.addTeamButton}
              onClick={() => {
                setNewTeam(true);
              }}
            >
              <Plus />
              <span>{'Add Team'}</span>
            </button>
            <div className={styles.teamsGrid}>
              {!isLoading && teams && teams.length
                ? teams.map((team, i) => (
                    <TeamCard key={`${team.name}-${i}`} team={team} />
                  ))
                : isLoading
                  ? 'Loading...'
                  : 'No teams found. Add some teams!'}
            </div>
          </div>
        </div>
      </PageView>
      <NewTeam open={newTeam} onClose={() => setNewTeam(false)} />
    </>
  ) : null;
};
