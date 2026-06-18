import { Link } from "react-router-dom";

function Header() {
  return (
    <div>
     <Link to="/"><h1>Poké Builder</h1></Link> 
    </div>
  );
}

export default Header;