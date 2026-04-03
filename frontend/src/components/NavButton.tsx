// src/components/NavButton.tsx
import { useNavigate } from 'react-router-dom';
import { navButton } from '../style/Button';

interface NavButtonProps {
  label: string;
  path: string;
}

export default function NavButton({ label, path }: NavButtonProps) {
  const navigate = useNavigate();

  return (
    <button 
      onClick={() => navigate(path)} 
      style={navButton}
    >
      {label}
    </button>
  );
}