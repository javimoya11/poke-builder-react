export interface IAuthSchema {
  email: string;
  password: string;
  passwordRepeat?: string | null;
}

export interface IAuthForm {
  isOpen: boolean;
  onClose: () => void;
}
