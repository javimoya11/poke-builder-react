import { ChangeProfileNameModal } from 'components/ChangeProfileNameModal/ChangeProfileNameModal';
import { DeleteAccountModal } from 'components/DeleteAccountModal/DeleteAccountModal';
import { Dropdown } from 'feature/Dropdown/Dropdown';
import { Trash2, UserCog } from 'lucide-react';
import { useState } from 'react';
import styles from './ProfileSettings.module.css';

export const ProfileSettings = () => {
  const [changeNameOpen, setChangeNameOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  return (
    <>
      <Dropdown
        actions={[
          {
            label: 'Change profile name',
            icon: <UserCog size={16} />,
            callback: () => setChangeNameOpen(true)
          },
          {
            label: 'Delete account',
            icon: <Trash2 size={16} />,
            callback: () => setDeleteAccountOpen(true)
          }
        ]}
        trigger={({ toggle }) => (
          <button
            type="button"
            className={styles.profileSettings}
            onClick={toggle}
          >
            Profile settings
          </button>
        )}
      />
      <ChangeProfileNameModal
        open={changeNameOpen}
        onClose={() => setChangeNameOpen(false)}
      />
      <DeleteAccountModal
        open={deleteAccountOpen}
        onClose={() => setDeleteAccountOpen(false)}
      />
    </>
  );
};
