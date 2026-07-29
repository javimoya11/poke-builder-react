import { BackButton } from 'components/BackButton/BackButton';
import { ProfileSettings } from 'components/ProfileSettings/ProfileSettings';
import type { ReactNode } from 'react';
import styles from './PageView.module.css';

interface Props {
  children: ReactNode;
}

export const PageView = ({ children }: Props) => {
  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <ProfileSettings />
        <BackButton />
      </div>
      {children}
    </div>
  );
};
