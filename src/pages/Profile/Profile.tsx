import { NewTeam } from 'components/NewTeam/NewTeam';
import { PageView } from 'components/PageView/PageView';
import { Spinner } from 'components/Spinner/Spinner';
import { TeamCard } from 'components/TeamCard/TeamCard';
import { useTeams } from 'hooks/useTeams';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalStore } from '../../shared/stores/useGlobalStore';
import styles from './Profile.module.css';

export const Profile = () => {
  const navigate = useNavigate();
  const { user, authReady } = useGlobalStore();
  const [newTeam, setNewTeam] = useState(false);
  const [search, setSearch] = useState('');
  const { data, isLoading } = useTeams(user?.id);

  const teams = data ? [...data].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) : []

  const query = search.trim().toLowerCase();
  const filteredTeams = query.length
    ? teams.filter((team) => team.name.toLowerCase().includes(query))
    : teams;

  useEffect(() => {
    if (authReady && !user) {
      navigate('/');
    }
  }, [authReady, user, navigate]);

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
            {!isLoading && teams.length > 0 && (
              <div className={styles.searchContainer}>
                <input
                  id="team-search"
                  className={styles.searchInput}
                  name="team-search"
                  type="text"
                  placeholder="Search teams..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            )}
            {isLoading ? (
              <Spinner />
            ) : (
              <div className={styles.teamsGrid}>
                {teams.length === 0
                  ? 'No teams found. Add some teams!'
                  : filteredTeams.length
                    ? filteredTeams.map((team) => (
                        <TeamCard key={team.id} team={team} />
                      ))
                    : 'No teams match your search.'}
              </div>
            )}
          </div>
        </div>
      </PageView>
      <NewTeam open={newTeam} onClose={() => setNewTeam(false)} />
    </>
  ) : null;
};
