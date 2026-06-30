import { ReactNode } from 'react';

export interface IDropdownAction {
  label: string;
  callback: () => void;
  icon?: ReactNode; // e.g. <LogOut size={16} /> from lucide-react
}

export interface IDropdownTriggerState {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

export interface IDropdownProps {
  actions: IDropdownAction[];
  trigger: (state: IDropdownTriggerState) => ReactNode;
  align?: 'left' | 'right'; // defaults to 'right' (anchored to the right, as in the header)
  direction?: 'down' | 'up'; // defaults to 'down'
}

export interface IDropdownOptionProps {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
}
