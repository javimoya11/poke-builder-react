import { AuthError } from '@supabase/supabase-js';
import { Modal } from 'feature/Modal/Modal';
import { useState } from 'react';
import { sendMagicLink } from '../../lib/auth';
import './AuthForm.css';

interface IAuthForm {
  isOpen: boolean;
  onClose: () => void;
}
export const AuthForm = ({ isOpen, onClose }: IAuthForm) => {
  const [emailValue, setEmailValue] = useState<string | null>(null);
  const [errorValue, setErrorValue] = useState<AuthError | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form
        id="sign-in"
        className="auth-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setErrorValue(null);
          setLoading(true);
          if (!emailValue) return;
          const { error } = await sendMagicLink(emailValue.trim());
          if (error) {
            setErrorValue(error);
            return;
          }
          setLoading(false);
        }}
      >
        <label htmlFor="email">
          Enter your email
          <input
            type="email"
            name="email"
            id="email"
            autoComplete="email"
            required
            onChange={(e) => {
              setEmailValue(e.target.value);
            }}
          />
        </label>
        <button type="submit" form="sign-in" disabled={loading}>
          Send
        </button>
        {errorValue ? <div>ERROR</div> : null}
      </form>
    </Modal>
  );
};
