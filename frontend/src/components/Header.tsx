import { CheckCircle2 } from 'lucide-react';
import { getAvatarStyle } from '../lib/avatar';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  email: string;
  onOpenProfile: () => void;
}

export function Header({ email, onOpenProfile }: HeaderProps) {
  const avatar = getAvatarStyle(email);

  return (
    <header className="app-header">
      <div className="brand-box">
        <div className="brand-icon">
          <CheckCircle2 size={20} />
        </div>
        <span className="brand-title">ToDoApp</span>
      </div>

      <div className="header-right">
        <ThemeToggle />
        <button
          type="button"
          className="avatar-btn"
          style={{ backgroundColor: avatar.backgroundColor }}
          onClick={onOpenProfile}
          aria-label="Open Profile"
          title="Profile & Settings"
        >
          {avatar.letter}
        </button>
      </div>
    </header>
  );
}
