import { useNavigate } from 'react-router-dom';

function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      className="back-button"
      type="button"
      onClick={() => navigate('/')}
    >
      Exit
    </button>
  );
}

export default BackButton;
