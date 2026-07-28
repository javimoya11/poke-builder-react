import { Modal } from 'feature/Modal/Modal';
import { useState } from 'react';
import styles from './DeleteItem.module.css';
import { IDeleteItem } from './types.DeleteItem';

export const DeleteItem = ({
  open,
  onClose,
  item,
  itemType,
  handler,
  onCancel
}: IDeleteItem) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const confirmHandler = async () => {
    setLoading(true);
    setFormError(null);
    try {
      await handler();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : `Could not delete the ${itemType}.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={open} onClose={onClose} className={styles.modal}>
      <div className={styles.container}>
        <div className={styles.message}>
          <span>Are you sure you want to delete this {itemType}?</span>
          <span className={styles.teamName}>{item.name}</span>
        </div>
        {formError && (
          <div
            className={`${styles.banner} ${styles.bannerError}`}
            role="alert"
          >
            {formError}
          </div>
        )}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancel}
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className={styles.confirm}
            onClick={confirmHandler}
            disabled={loading}
          >
            {loading ? (
              <span className="button-spinner" aria-label="Loading" />
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
