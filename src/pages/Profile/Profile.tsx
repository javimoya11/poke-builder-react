import { useNavigate } from 'react-router-dom';
import { useGlobalStore } from '../../shared/stores/useGlobalStore';
import styles from './Profile.module.css';

export const Profile = () => {
  const navigate = useNavigate();
  const { user } = useGlobalStore();

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className={styles.container}>
      <button
        className="back-button"
        type="button"
        onClick={() => {
          navigate('/');
        }}
      >
        Exit
      </button>
      <div>Name: {user?.user_metadata.display_name}</div>
    </div>
  );
};
