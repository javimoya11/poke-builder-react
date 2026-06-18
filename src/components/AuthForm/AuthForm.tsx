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
  const [passValue, setPassValue] = useState<string | null>(null);
  const [errorValue, setErrorValue] = useState<AuthError | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<'signIn' | 'signUp'>('signIn');
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form
        id={formMode === 'signIn' ? 'sign-in' : 'sign-up'}
        className="auth-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setErrorValue(null);
          setLoading(true);
          let error: AuthError | null = null;
          if (!emailValue) return;
          if (formMode === 'signUp') {
            error = (await sendMagicLink(emailValue.trim())).error;
          } else {
            //
          }
          if (error) {
            setErrorValue(error);
            return;
          }
          setLoading(false);
        }}
      >
        <nav>
          <button type="button" onClick={() => setFormMode('signIn')}>
            Sign In
          </button>
          <button type="button" onClick={() => setFormMode('signUp')}>
            Sign Up
          </button>
        </nav>
        <label htmlFor="email">
          Email
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
        <label htmlFor="pass">
          Password
          <input
            type="password"
            name="pass"
            id="pass"
            autoComplete="new-password"
            required
            onChange={(e) => {
              setPassValue(e.target.value);
            }}
          />
        </label>
        {formMode === 'signUp' && (
          <label htmlFor="pass-confirm">
            Confirm Password
            <input
              type="password"
              name="pass-confirm"
              id="pass-confirm"
              autoComplete="new-password webauthn"
              required
              onChange={(e) => {
                setPassValue(e.target.value);
              }}
            />
          </label>
        )}
        <button
          type="submit"
          form={formMode === 'signUp' ? 'sign-in' : 'sign-up'}
          disabled={loading}
        >
          {loading ? (
            <span className="button-spinner" aria-label="Loading" />
          ) : (
            'Send'
          )}
        </button>
        {errorValue ? <div>ERROR</div> : null}
      </form>
    </Modal>
  );
};
