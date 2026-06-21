import styles from './Dropdown.module.css';
import { IDropdownOptionProps } from './types.Dropdown';

export const DropdownOption = ({ label, icon, onSelect }: IDropdownOptionProps) => (
  <button type="button" className={styles.item} role="menuitem" onClick={onSelect}>
    {icon && <span className={styles.icon}>{icon}</span>}
    <span>{label}</span>
  </button>
);
