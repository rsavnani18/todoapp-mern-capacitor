import { useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  KeyRound,
  LogOut,
  Mail,
  Moon,
  Sun,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { authApi } from '../services/api';
import { GitHubPill } from '../components/GitHubPill';
import { nativeHaptics } from '../services/capacitor';

interface ProfileScreenProps {
  onBack: () => void;
}

export function ProfileScreen({ onBack }: ProfileScreenProps) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || 'U';
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString([], {
        month: 'short',
        year: 'numeric',
      })
    : 'Member';

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setSaving(true);
    try {
      const res = await authApi.changePassword({
        currentPassword,
        newPassword,
      });
      setSuccess(res.message || 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      nativeHaptics.success();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update password'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 pt-safe pb-safe px-4.5 flex flex-col gap-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => {
            nativeHaptics.light();
            onBack();
          }}
          aria-label="Go back"
          className="w-9 h-9 rounded-xl bg-bg-secondary border border-border-subtle text-text-secondary hover:text-text-primary flex items-center justify-center active:scale-95 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <h2 className="text-base font-bold">Account & Settings</h2>

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
      </div>

      {/* User Hero Card */}
      <div className="rounded-3xl bg-bg-secondary border border-border-subtle p-6 flex flex-col items-center text-center gap-2">
        <div className="w-18 h-18 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 text-white text-2xl font-extrabold flex items-center justify-center shadow-lg shadow-violet-600/25 mb-1">
          {initial}
        </div>
        <h3 className="text-lg font-bold">{user?.name}</h3>
        <div className="flex flex-wrap justify-center gap-2 mt-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bg-elevated text-xs text-text-secondary">
            <Mail className="w-3.5 h-3.5 text-accent-text" />
            {user?.email}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-bg-elevated text-xs text-text-secondary">
            <Calendar className="w-3.5 h-3.5 text-accent-text" />
            Joined {joinedDate}
          </span>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="rounded-3xl bg-bg-secondary border border-border-subtle p-4.5 flex flex-col gap-3.5">
        <div className="flex items-center gap-2 text-accent-text">
          <KeyRound className="w-4 h-4" />
          <h4 className="text-sm font-bold text-text-primary">
            Change Password
          </h4>
        </div>

        <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-3">
          {error && (
            <div className="px-3.5 py-2.5 rounded-xl bg-danger-bg border border-danger-border text-danger text-xs font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="px-3.5 py-2.5 rounded-xl bg-success-bg text-success text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <input
            type="password"
            required
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-bg-elevated border border-border-subtle text-sm focus:border-accent outline-none transition"
          />

          <input
            type="password"
            required
            minLength={6}
            placeholder="New Password (min 6 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-bg-elevated border border-border-subtle text-sm focus:border-accent outline-none transition"
          />

          <button
            type="submit"
            disabled={saving}
            className="h-11 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground text-xs font-bold shadow-md shadow-violet-600/20 active:scale-[0.98] disabled:opacity-60 transition"
          >
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      <div className="flex justify-center">
        <GitHubPill />
      </div>

      {/* Sign Out Button */}
      <div className="mt-auto pt-2 pb-2">
        <button
          type="button"
          onClick={() => {
            nativeHaptics.medium();
            logout();
          }}
          className="w-full h-12 rounded-xl bg-danger-bg border border-danger-border text-danger text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
