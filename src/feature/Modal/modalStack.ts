/**
 * Global stack of currently-open modals, used to make the mobile/browser
 * back button close the top-most modal instead of leaving the page.
 *
 * react-router only supports a single active `useBlocker` for the whole app
 * (registering more than one silently ignores all but the last), so the
 * back-button interception lives in one blocker at the app root (see
 * `useModalBackButton`) instead of one per `Modal` instance. Every open
 * modal registers its close callback here; opening the first one pushes a
 * single history entry, and each back-button press pops and closes the
 * top-most modal, only letting the real back navigation through once the
 * stack is empty again.
 */
let stack: (() => void)[] = [];

export const pushModal = (onClose: () => void) => {
  const wasEmpty = stack.length === 0;
  stack = [...stack, onClose];
  return wasEmpty;
};

export const removeModal = (onClose: () => void) => {
  stack = stack.filter((entry) => entry !== onClose);
  return stack.length === 0;
};

export const hasOpenModals = () => stack.length > 0;

/** Closes and removes the top-most (most recently opened) modal. */
export const closeTopModal = () => {
  const top = stack[stack.length - 1];
  if (!top) return;
  stack = stack.slice(0, -1);
  top();
};
