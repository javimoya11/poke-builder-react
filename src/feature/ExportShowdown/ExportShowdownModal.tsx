import { Modal } from 'feature/Modal/Modal';
import { IExportShowdownModal } from './types.ExportShowdown';

export const ExportShowdownModal = ({
  open,
  onClose
}: IExportShowdownModal) => {
  return (
    <Modal isOpen={open} onClose={onClose}>
      <div></div>
    </Modal>
  );
};
