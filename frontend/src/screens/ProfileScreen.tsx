import { useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAvatarStyle } from '../lib/avatar';
import { GitHubBadge } from '../components/GitHubBadge';
import { LogoutButton } from '../components/LogoutButton';
import { ThemeToggle } from '../components/ThemeToggle';

interface ProfileScreenProps {
  onBack: () => void;
}

export function ProfileScreen({ onBack }: ProfileScreenProps) {
  const { user, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user) return null;

  const avatar = getAvatarStyle(user.email);

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const msg = await changePassword(currentPassword, newPassword);
      setSuccess(msg);
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-screen">
      <header className="profile-top-bar">
        <button
          type="button"
          className="icon-btn"
          onClick={onBack}
          aria-label="Go back"
        >
          <ArrowLeft size={19} />
        </button>
        <h2>Profile</h2>
        <ThemeToggle />
      </header>

      <div className="profile-hero-card">
        <div
          className="profile-large-avatar"
          style={{ backgroundColor: avatar.backgroundColor }}
        >
          {avatar.letter}
        </div>
        <h3>{user.name}</h3>
        <div className="profile-info-pills">
          <span>
            <UserIcon size={13} /> {user.name}
          </span>
          <span>
            <Mail size={13} /> {user.email}
          </span>
        </div>
      </div>

      <div className="profile-section-card">
        <div className="section-title-row">
          <KeyRound size={17} />
          <h4>Change Password</h4>
        </div>

        <form className="auth-form" onSubmit={handlePasswordChange}>
          {error && <div className="error-banner">{error}</div>}
          {success && (
            <div className="success-banner">
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </div>
          )}

          <div className="input-group">
            <Lock size={17} className="input-icon" />
            <input
              type={showCurrent ? 'text' : 'password'}
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="has-right-btn"
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowCurrent((p) => !p)}
            >
              {showCurrent ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          <div className="input-group">
            <Lock size={17} className="input-icon" />
            <input
              type={showNew ? 'text' : 'password'}
              placeholder="New Password (min 6 chars)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="has-right-btn"
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowNew((p) => !p)}
            >
              {showNew ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span className="btn-loading">
                <span className="btn-spinner" />
                Updating...
              </span>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>

      <div
        className="profile-footer"
        style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
      >
        <GitHubBadge />
        <LogoutButton />
      </div>
    </div>
  );
}
