import { useEffect, useRef, useState } from 'react';
import { DropdownOption } from './DropdownOption';
import { IDropdownProps } from './types.Dropdown';
import './Dropdown.css';

export const Dropdown = ({ actions, trigger, align = 'right' }: IDropdownProps) => {
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
    <div className="dropdown-wrapper" ref={containerRef}>
      {trigger({ open, toggle, close })}
      {open && (
        <ul className={`dropdown-menu dropdown-menu--${align}`} role="menu">
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
