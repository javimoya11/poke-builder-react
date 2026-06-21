import { IDropdownOptionProps } from './types.Dropdown';

export const DropdownOption = ({ label, icon, onSelect }: IDropdownOptionProps) => (
  <button type="button" className="dropdown-item" role="menuitem" onClick={onSelect}>
    {icon && <span className="dropdown-item__icon">{icon}</span>}
    <span className="dropdown-item__label">{label}</span>
  </button>
);
