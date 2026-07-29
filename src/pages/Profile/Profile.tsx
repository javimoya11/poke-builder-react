import { NewTeam } from 'components/NewTeam/NewTeam';
import { PageView } from 'components/PageView/PageView';
import { Spinner } from 'components/Spinner/Spinner';
import { TeamCard } from 'components/TeamCard/TeamCard';
import { Pagination } from 'feature/Pagination/Pagination';
import { useTeams } from 'hooks/useTeams';
import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalStore } from '../../shared/stores/useGlobalStore';
import styles from './Profile.module.css';

/** Number of team cards per page; fits one screen at 100% zoom on a 1080p display. */
const PAGE_SIZE = 14;

export const Profile = () => {
  const navigate = useNavigate();
  const { user, authReady } = useGlobalStore();
  const [newTeam, setNewTeam] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useTeams(user?.id);

  const teams = data ? [...data].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) : []

  const query = search.trim().toLowerCase();
  const filteredTeams = query.length
    ? teams.filter((team) => team.name.toLowerCase().includes(query))
    : teams;

  const totalPages = Math.max(1, Math.ceil(filteredTeams.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedTeams = filteredTeams.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

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
              <>
                <div className={styles.teamsGrid}>
                  {teams.length === 0
                    ? 'No teams found. Add some teams!'
                    : pagedTeams.length
                      ? pagedTeams.map((team) => (
                          <TeamCard key={team.id} team={team} />
                        ))
                      : 'No teams match your search.'}
                </div>
                {filteredTeams.length > PAGE_SIZE && (
                  <Pagination
                    page={safePage}
                    totalItems={filteredTeams.length}
                    pageSize={PAGE_SIZE}
                    onPageChange={setPage}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </PageView>
      <NewTeam open={newTeam} onClose={() => setNewTeam(false)} />
    </>
  ) : null;
};
