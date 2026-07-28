import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DropdownOption } from './DropdownOption';
import styles from './Dropdown.module.css';
import { IDropdownProps } from './types.Dropdown';

const MARGIN = 8;
const GAP = 8;

// Walks up from the trigger and returns the highest z-index found on any
// positioned ancestor, so a menu portaled to <body> can stack above the
// modal (or any layer) it was opened from.
const highestAncestorZIndex = (el: HTMLElement | null): number => {
  let highest = 0;
  let node: HTMLElement | null = el;
  while (node && node !== document.body) {
    const style = getComputedStyle(node);
    if (style.position !== 'static') {
      const z = parseInt(style.zIndex, 10);
      if (!Number.isNaN(z)) highest = Math.max(highest, z);
    }
    node = node.parentElement;
  }
  return highest;
};

export const Dropdown = ({ actions, trigger, align = 'right', direction = 'down', header }: IDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [zIndex, setZIndex] = useState<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const close = () => setOpen(false);
  const toggle = () => setOpen((prev) => !prev);

  const position = () => {
    const trigger = containerRef.current;
    const menu = menuRef.current;
    if (!trigger || !menu) return;

    const t = trigger.getBoundingClientRect();
    const { offsetWidth: mw, offsetHeight: mh } = menu;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Horizontal: honour align, then flip / clamp to stay on screen.
    let left = align === 'right' ? t.right - mw : t.left;
    if (left + mw > vw - MARGIN) left = t.right - mw;
    if (left < MARGIN) left = t.left;
    left = Math.min(Math.max(left, MARGIN), vw - mw - MARGIN);

    // Vertical: honour direction, then flip if it would overflow.
    let top = direction === 'up' ? t.top - mh - GAP : t.bottom + GAP;
    if (direction === 'down' && top + mh > vh - MARGIN && t.top - mh - GAP >= MARGIN) {
      top = t.top - mh - GAP;
    } else if (direction === 'up' && top < MARGIN && t.bottom + mh + GAP <= vh - MARGIN) {
      top = t.bottom + GAP;
    }
    top = Math.min(Math.max(top, MARGIN), vh - mh - MARGIN);

    setCoords({ top, left });
  };

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      close();
    };
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const onReflow = () => position();
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onReflow);
    window.addEventListener('scroll', onReflow, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onReflow);
      window.removeEventListener('scroll', onReflow, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useLayoutEffect(() => {
    if (open) {
      const ancestorZ = highestAncestorZIndex(containerRef.current);
      setZIndex(ancestorZ > 0 ? ancestorZ + 1 : undefined);
      position();
    } else {
      setCoords(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div className={styles.wrapper} ref={containerRef}>
      {trigger({ open, toggle, close })}
      {open &&
        createPortal(
          <ul
            ref={menuRef}
            className={styles.menu}
            role="menu"
            style={{
              top: coords?.top ?? 0,
              left: coords?.left ?? 0,
              zIndex,
              visibility: coords ? 'visible' : 'hidden'
            }}
          >
            {header && (
              <li role="presentation" className={styles.header}>
                {header}
              </li>
            )}
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
          </ul>,
          document.body
        )}
    </div>
  );
};
