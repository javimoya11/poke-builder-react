import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <p>© 2025-2026 Poké Builder. MIT license.</p>
      <p>
        Designed by{' '}
        <a
          href="https://github.com/javimoya11"
          target="_blank"
          rel="noopener noreferrer"
        >
          Javi Moya
        </a>
      </p>
    </footer>
  );
};
