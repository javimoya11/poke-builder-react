import { SignInButton } from 'components/SignInButton/SignInButton';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';

function Header() {
  return (
    <header className={styles.header}>
      <Link to="/">
        <h1>Poké Builder</h1>
      </Link>
      <SignInButton />
    </header>
  );
}

export default Header;
