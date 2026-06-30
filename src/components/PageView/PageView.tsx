import { BackButton } from 'components/BackButton/BackButton';
import type { ReactNode } from 'react';
import styles from './PageView.module.css';

interface Props {
  children: ReactNode;
}

export const PageView = ({ children }: Props) => {
  return (
    <div className={styles.container}>
      <BackButton />
      {children}
    </div>
  );
};
