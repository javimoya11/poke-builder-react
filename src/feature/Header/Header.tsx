import { Link } from "react-router-dom";
import "./Header.css";
import { SignInButton } from "components/SignInButton/SignInButton";

function Header() {
  return (
    <header>
      <Link to="/"><h1>Poké Builder</h1></Link>
      <SignInButton />
    </header>
  );
}

export default Header;