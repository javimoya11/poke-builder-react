import { X } from 'lucide-react';
import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

/**
 * Open modals, oldest first. Modals stack (one can open another on top), so
 * the body scroll lock is only released once the last one closes, and Escape
 * only reaches the top-most modal instead of collapsing the whole stack.
 */
const openModals: symbol[] = [];

export const Modal = ({ isOpen, onClose, children, className }: ModalProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const id = Symbol('modal');
    openModals.push(id);

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openModals[openModals.length - 1] === id) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      const index = openModals.indexOf(id);
      if (index !== -1) openModals.splice(index, 1);
      if (!openModals.length) {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay}>
      <div className={`${styles.content} ${className ?? ''}`}>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Cerrar"
        >
          <X size={16} />
        </button>
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.getElementById('modal') ?? document.body
  );
};
