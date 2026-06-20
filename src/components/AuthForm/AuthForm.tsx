import { AuthError, Session, User } from '@supabase/supabase-js';
import { Modal } from 'feature/Modal/Modal';
import { useState } from 'react';
import { signIn, signUp } from '../../lib/auth';
import { useGlobalStore } from '../../shared/stores/useGlobalStore';
import './AuthForm.css';
import { IAuthForm } from './types.AuthForm';

export const AuthForm = ({ isOpen, onClose }: IAuthForm) => {
  const { setUser } = useGlobalStore();
  const [emailValue, setEmailValue] = useState<string | null>(null);
  const [passValue, setPassValue] = useState<string | null>(null);
  const [errorValue, setErrorValue] = useState<AuthError | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [formMode, setFormMode] = useState<'signIn' | 'signUp'>('signIn');

  const submitHandler = async () => {
    setErrorValue(null);
    setLoading(true);
    let error: AuthError | null = null;
    let data: { user: User | null; session: Session | null } = {
      user: null,
      session: null
    };
    if (!emailValue || !passValue) return;
    if (formMode === 'signUp') {
      const { error: signUpError, data: signUpData } = await signUp(
        emailValue.trim(),
        passValue
      );
      error = signUpError;
      data = signUpData;
    } else {
      const { error: signUpError, data: signUpData } = await signIn(
        emailValue.trim(),
        passValue
      );
      error = signUpError;
      data = signUpData;
    }
    if (error) {
      setErrorValue(error);
      return;
    } else {
      setErrorValue(null);
    }
    setUser(data?.user);
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form
        id={formMode === 'signIn' ? 'sign-in' : 'sign-up'}
        className="auth-form"
        onSubmit={async (e) => {
          e.preventDefault();
          await submitHandler();
        }}
      >
        <nav>
          <button
            type="button"
            className={formMode === 'signUp' ? '' : 'active'}
            onClick={() => setFormMode('signIn')}
          >
            Sign In
          </button>
          <button
            type="button"
            className={formMode === 'signUp' ? 'active' : ''}
            onClick={() => setFormMode('signUp')}
          >
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
          className="submit"
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
