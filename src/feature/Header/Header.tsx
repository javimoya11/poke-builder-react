import { SignInButton } from 'components/SignInButton/SignInButton';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';

export const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.titleGroup}>
        <Link to="/">
          <h1>Poké Builder</h1>
        </Link>
        <p className={styles.tagline}>Pokémon Showdown exporter and Pokémon team builder</p>
      </div>
      <SignInButton />
    </header>
  );
};
