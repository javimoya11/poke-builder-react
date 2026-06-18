import { UserPen, UserRound } from 'lucide-react';
import { useGlobalStore } from '../../shared/stores/useGlobalStore';
import './SignInButton.css';

export const SignInButton = () => {
  const { user } = useGlobalStore();
  return (
    <button className="dropdown" type="button">
      {user ? <UserRound /> : <UserPen />}
    </button>
  );
};
