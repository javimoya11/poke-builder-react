import { useCallback, useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { closeTopModal, hasOpenModals } from './modalStack';

/**
 * Mounted once at the app root. Intercepts the back-button POP while any
 * modal is open (react-router only allows one active `useBlocker` app-wide,
 * so this can't live inside each `Modal` instance) and closes the top-most
 * modal instead of letting the browser navigate away. Only lets the POP
 * through once the modal stack is empty.
 */
export const useModalBackButton = () => {
  const shouldBlock = useCallback(
    ({ historyAction }: { historyAction: string }) =>
      historyAction === 'POP' && hasOpenModals(),
    []
  );
  const blocker = useBlocker(shouldBlock);

  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    closeTopModal();
    if (hasOpenModals()) {
      blocker.reset();
    } else {
      blocker.proceed();
    }
  }, [blocker]);
};
