import { useEffect, useRef, useState } from 'react';
import { DropdownOption } from './DropdownOption';
import styles from './Dropdown.module.css';
import { IDropdownProps } from './types.Dropdown';

export const Dropdown = ({ actions, trigger, align = 'right', direction = 'down' }: IDropdownProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);
  const toggle = () => setOpen((prev) => !prev);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close();
    };
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div className={styles.wrapper} ref={containerRef}>
      {trigger({ open, toggle, close })}
      {open && (
        <ul
          className={`${styles.menu} ${align === 'right' ? styles.menuRight : styles.menuLeft} ${direction === 'up' ? styles.menuUp : ''}`}
          role="menu"
        >
          {actions.map((action, index) => (
            <li role="none" key={`${action.label}-${index}`}>
              <DropdownOption
                label={action.label}
                icon={action.icon}
                onSelect={() => {
                  action.callback();
                  close();
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
