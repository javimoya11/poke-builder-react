import { AuthForm } from 'components/AuthForm/AuthForm';
import { Dropdown } from 'feature/Dropdown/Dropdown';
import { LogOut, UserPen, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useGlobalStore } from '../../shared/stores/useGlobalStore';
import './SignInButton.css';

export const SignInButton = () => {
  const { user } = useGlobalStore();
  const [authOpen, setAuthOpen] = useState(false);

  if (!user) {
    return (
      <>
        <button
          className="dropdown"
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
          callback: () => console.log('sign out')
        }
      ]}
      trigger={({ toggle }) => (
        <button className="dropdown" type="button" onClick={toggle}>
          <UserRound />
        </button>
      )}
    />
  );
};
