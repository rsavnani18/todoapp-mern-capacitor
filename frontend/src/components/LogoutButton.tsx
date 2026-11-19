import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button type="button" className="logout-full-btn" onClick={logout}>
      <LogOut size={18} />
      <span>Sign Out</span>
    </button>
  );
}
