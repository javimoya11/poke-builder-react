import { AuthForm } from 'components/AuthForm/AuthForm';
import { Dropdown } from 'feature/Dropdown/Dropdown';
import { LogOut, UserPen, UserRound } from 'lucide-react';
import { useState } from 'react';
import { signOut } from '../../lib/auth';
import { useGlobalStore } from '../../shared/stores/useGlobalStore';
import styles from './SignInButton.module.css';

export const SignInButton = () => {
  const { user, authReady } = useGlobalStore();
  const [authOpen, setAuthOpen] = useState(false);

  // Mientras se restaura la sesión, mostramos un placeholder neutro para no
  // parpadear entre "login" y "logueado".
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
          label: 'Log Out',
          icon: <LogOut size={16} />,
          // The auth listener (useAuthSync) clears the store on SIGNED_OUT,
          // which re-renders this button back to the logged-out state.
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
