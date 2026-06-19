import { IAuthSchema } from './types.AuthForm';

export const formValidation = (
  payload: IAuthSchema,
  formMode: 'signUp' | 'signIn'
) => {
  let valid = true;
  if (formMode === 'signUp') {
    valid = payload.password === payload.passwordRepeat;
  }
  return valid;
};
