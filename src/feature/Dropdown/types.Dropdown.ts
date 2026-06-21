import { ReactNode } from 'react';

export interface IDropdownAction {
  label: string;
  callback: () => void;
  icon?: ReactNode; // p. ej. <LogOut size={16} /> de lucide-react
}

export interface IDropdownTriggerState {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

export interface IDropdownProps {
  actions: IDropdownAction[];
  trigger: (state: IDropdownTriggerState) => ReactNode;
  align?: 'left' | 'right'; // por defecto 'right' (anclado a la derecha, como en el header)
}

export interface IDropdownOptionProps {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
}
