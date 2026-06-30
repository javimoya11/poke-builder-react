import styles from './Range.module.css';
import type { RangeProps } from './types.Range';

export const Range = ({ range, name }: RangeProps) => {
  const percentage = (r: number): string => {
    return `${(r * 100) / 255}%`;
  };

  const color = (): string => {
    if (range < 40) {
      return 'red';
    } else if (range >= 40 && range < 50) {
      return 'tomato';
    } else if (range >= 50 && range < 80) {
      return 'sandybrown';
    } else if (range >= 80 && range < 100) {
      return 'gold';
    } else if (range >= 100 && range < 120) {
      return 'forestgreen';
    } else if (range >= 120) {
      return 'lime';
    } else {
      return 'lightgray';
    }
  };

  return (
    <div className={styles.container}>
      <span className={styles.statName}>{name.replace('-', ' ')}</span>
      <span className={styles.statNumber}>{range}</span>
      <div className={styles.wrap}>
        <div
          className={styles.bar}
          style={{ width: percentage(range), backgroundColor: color() }}
        ></div>
      </div>
    </div>
  );
};
