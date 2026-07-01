import { statColor } from 'utils/statColor';
import styles from './Range.module.css';
import type { RangeProps } from './types.Range';

export const Range = ({ range, name }: RangeProps) => {
  const percentage = (r: number): string => {
    return `${(r * 100) / 255}%`;
  };

  return (
    <div className={styles.container}>
      <span className={styles.statName}>{name.replace('-', ' ')}</span>
      <span className={styles.statNumber}>{range}</span>
      <div className={styles.wrap}>
        <div
          className={styles.bar}
          style={{ width: percentage(range), backgroundColor: statColor(range) }}
        ></div>
      </div>
    </div>
  );
};
