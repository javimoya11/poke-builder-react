import PageView from 'components/PageView/PageView';
import { TeamCard } from 'components/TeamCard/TeamCard';
import { useTeams } from 'hooks/useTeams';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalStore } from '../../shared/stores/useGlobalStore';

export const Profile = () => {
  const navigate = useNavigate();
  const { user } = useGlobalStore();
  const { data: teams, isLoading } = useTeams(user?.id);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  });

  return user ? (
    <PageView>
      <div className="profile-body">
        <div className="teams-container">
          <h2>Teams</h2>
          {!isLoading && teams && teams.length
            ? teams.map((team, i) => (
                <TeamCard key={`${team.name}-${i}`} team={team} />
              ))
            : isLoading
              ? 'Loading...'
              : 'No teams loaded'}
        </div>
      </div>
    </PageView>
  ) : null;
};
