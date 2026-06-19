import { AuthForm } from 'components/AuthForm/AuthForm';
import { UserPen, UserRound } from 'lucide-react';
import { useState } from 'react';
import { useGlobalStore } from '../../shared/stores/useGlobalStore';
import './SignInButton.css';

export const SignInButton = () => {
  const { user } = useGlobalStore();
  const [open, setOpen] = useState<boolean>(false);
  const [openDropdown, setOpenDropdown] = useState<boolean>(false);
  return (
    <>
      <button
        className="dropdown"
        type="button"
        onClick={() => {
          if (!user) setOpen(true);
          setOpenDropdown(!openDropdown);
        }}
      >
        {user ? <UserRound /> : <UserPen />}
      </button>
      <AuthForm isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
};
