import { useNavigate } from 'react-router-dom';

export const BackButton = () => {
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
};
