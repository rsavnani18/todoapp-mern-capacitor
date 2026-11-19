import { useState, type FormEvent } from 'react';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GitHubBadge } from '../components/GitHubBadge';
import { MathCaptcha } from '../components/MathCaptcha';
import { ThemeToggle } from '../components/ThemeToggle';

export function AuthScreen() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [captchaReset, setCaptchaReset] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const switchMode = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setError('');
    setPassword('');
    setShowPassword(false);
    setCaptchaValid(false);
    setCaptchaReset((prev) => prev + 1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!captchaValid) {
      setError('Please solve the math captcha correctly.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setCaptchaValid(false);
      setCaptchaReset((prev) => prev + 1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-top-bar">
        <ThemeToggle />
      </div>

      <div className="auth-hero">
        <div className="app-logo-badge">
          <CheckCircle2 size={32} />
        </div>
        <h1>ToDoApp</h1>
        <p>Personal workspace for your daily goals</p>
      </div>

      <div className="segmented-control">
        <button
          type="button"
          className={isLogin ? 'active' : ''}
          onClick={() => switchMode(true)}
        >
          Sign In
        </button>
        <button
          type="button"
          className={!isLogin ? 'active' : ''}
          onClick={() => switchMode(false)}
        >
          Create Account
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {error && <div className="error-banner">{error}</div>}

        {!isLogin && (
          <div className="input-group">
            <UserIcon size={18} className="input-icon" />
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
            />
          </div>
        )}

        <div className="input-group">
          <Mail size={18} className="input-icon" />
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <Lock size={18} className="input-icon" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="has-right-btn"
          />
          <button
            type="button"
            className="eye-btn"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <MathCaptcha key={captchaReset} onVerifyChange={setCaptchaValid} />

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? (
            <span className="btn-loading">
              <span className="btn-spinner" />
              {isLogin ? 'Signing in...' : 'Creating account...'}
            </span>
          ) : isLogin ? (
            'Continue'
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <GitHubBadge />
    </div>
  );
}
