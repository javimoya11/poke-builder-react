import styles from './Switch.module.css';
import { ISwitchProps } from './types.Switch';

export const Switch = ({ checked, onChange, id, disabled, ...rest }: ISwitchProps) => (
  <span className={styles.switch}>
    <input
      id={id}
      type="checkbox"
      role="switch"
      className={styles.input}
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      {...rest}
    />
    <span className={styles.track} aria-hidden="true">
      <span className={styles.thumb} />
    </span>
  </span>
);
