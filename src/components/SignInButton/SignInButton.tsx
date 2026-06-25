import { AuthForm } from 'components/AuthForm/AuthForm';
import { Dropdown } from 'feature/Dropdown/Dropdown';
import { LogOut, UserPen, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from '../../lib/auth';
import { useGlobalStore } from '../../shared/stores/useGlobalStore';
import styles from './SignInButton.module.css';

export const SignInButton = () => {
  const { user, authReady } = useGlobalStore();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);

  if (!authReady) {
    return (
      <button
        className={styles.dropdown}
        type="button"
        disabled
        aria-label="Loading session"
      >
        <span className="button-spinner" />
      </button>
    );
  }

  if (!user) {
    return (
      <>
        <button
          className={styles.dropdown}
          type="button"
          onClick={() => setAuthOpen(true)}
        >
          <UserPen />
        </button>
        <AuthForm isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      </>
    );
  }

  return (
    <Dropdown
      actions={[
        {
          label: 'Profile',
          icon: <UserRound size={16} />,
          callback: () => {
            navigate('/profile');
          }
        },
        {
          label: 'Log Out',
          icon: <LogOut size={16} />,
          callback: () => void signOut()
        }
      ]}
      trigger={({ toggle }) => (
        <button className={styles.dropdown} type="button" onClick={toggle}>
          <UserRound />
        </button>
      )}
    />
  );
};
