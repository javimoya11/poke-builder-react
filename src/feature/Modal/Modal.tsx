import { X } from 'lucide-react';
import { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { pushModal, removeModal } from './modalStack';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export const Modal = ({ isOpen, onClose, children, className }: ModalProps) => {
  const navigate = useNavigate();
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  /**
   * Makes the mobile/browser back button close the modal instead of leaving
   * the page. Registers this modal on the shared stack in `modalStack.ts`;
   * the app-root `useModalBackButton` blocker (see there) is what actually
   * intercepts the back-button POP and closes the top-most modal — a single
   * blocker is used app-wide because react-router only supports one active
   * `useBlocker` at a time, silently ignoring the rest if more are
   * registered.
   *
   * A single history entry is pushed only on the open -> not-open transition
   * (not one per modal), so however many modals are stacked, exactly one
   * history entry represents "some modal is open"; it's only popped for
   * real once the stack empties.
   */
  useEffect(() => {
    if (!isOpen) return;
    const close = () => onCloseRef.current();
    const isFirst = pushModal(close);
    if (isFirst) navigate('', { state: { modalStack: true } });

    return () => {
      const isNowEmpty = removeModal(close);
      // Closing via the X/overlay while still the reason a history entry
      // exists: discard it so back-button presses aren't spent on a stack
      // that's already empty. Safe here (no external popstate race) — the
      // app-root blocker owns every back-button POP.
      if (isNowEmpty && history.state?.usr?.modalStack) navigate(-1);
    };
  }, [isOpen, navigate]);

  useEffect(() => {
    if (!isOpen) return;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
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
