import PageView from 'components/PageView/PageView';
import { useNavigate } from 'react-router-dom';
import { useGlobalStore } from '../../shared/stores/useGlobalStore';

export const Profile = () => {
  const navigate = useNavigate();
  const { user } = useGlobalStore();

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <PageView>
      <div>Name: {user?.user_metadata.display_name}</div>
    </PageView>
  );
};
