import { CheckSquare, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { nativeHaptics } from '../services/capacitor';

interface HeaderProps {
  onOpenProfile: () => void;
}

export function Header({ onOpenProfile }: HeaderProps) {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();

  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || 'U';

  return (
    <header className="flex items-center justify-between pb-1">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-accent text-accent-foreground flex items-center justify-center shadow-md shadow-violet-600/20">
          <CheckSquare className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-extrabold tracking-tight leading-none">
            ToDoApp
          </h1>
          <span className="text-[11px] font-medium text-text-secondary">
            Tasks & Notes
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => {
            nativeHaptics.light();
            toggleTheme();
          }}
          aria-label="Toggle theme"
          className="w-9 h-9 rounded-xl bg-bg-secondary border border-border-subtle text-text-secondary hover:text-accent-text flex items-center justify-center active:scale-95 transition"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={() => {
            nativeHaptics.light();
            onOpenProfile();
          }}
          aria-label="Open profile"
          className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 text-white text-sm font-bold flex items-center justify-center shadow-md shadow-violet-600/20 active:scale-95 transition"
        >
          {initial}
        </button>
      </div>
    </header>
  );
}
