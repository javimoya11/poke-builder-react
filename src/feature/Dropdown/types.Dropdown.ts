import { ReactNode } from 'react';

export interface IDropdownAction {
  label: string;
  callback: () => void;
  icon?: ReactNode;
}

export interface IDropdownTriggerState {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

export interface IDropdownProps {
  actions: IDropdownAction[];
  trigger: (state: IDropdownTriggerState) => ReactNode;
  align?: 'left' | 'right';
  direction?: 'down' | 'up';
}

export interface IDropdownOptionProps {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
}
