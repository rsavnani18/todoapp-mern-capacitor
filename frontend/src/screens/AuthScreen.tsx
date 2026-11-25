import { useState, type FormEvent } from 'react';
import {
  CheckSquare,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Moon,
  Sun,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { MathCaptcha } from '../components/MathCaptcha';
import { GitHubPill } from '../components/GitHubPill';
import { cn } from '../lib/cn';
import { nativeHaptics } from '../services/capacitor';

export function AuthScreen() {
  const { login, register } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [captchaValid, setCaptchaValid] = useState(false);
  const [captchaReset, setCaptchaReset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const switchMode = (next: 'login' | 'register') => {
    setMode(next);
    setError('');
    setCaptchaReset((n) => n + 1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register' && name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (!captchaValid) {
      setError('Please solve the security math check correctly');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
      nativeHaptics.success();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setCaptchaReset((n) => n + 1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 pt-safe pb-safe px-5 flex flex-col justify-between gap-6">
      {/* Top Theme Switcher */}
      <div className="flex justify-end pt-2">
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

      {/* Center Auth Form */}
      <div className="flex flex-col gap-5 my-auto">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-accent text-accent-foreground flex items-center justify-center shadow-lg shadow-violet-600/25">
            <CheckSquare className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">ToDoApp</h1>
          <p className="mt-1 text-xs text-text-secondary">
            Your personal Tasks & Keep-style Notes workspace
          </p>
        </div>

        {/* Segmented Control */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-bg-secondary border border-border-subtle">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={cn(
              'py-2.5 text-xs font-bold rounded-xl transition',
              mode === 'login'
                ? 'bg-accent text-accent-foreground shadow-xs'
                : 'text-text-secondary'
            )}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={cn(
              'py-2.5 text-xs font-bold rounded-xl transition',
              mode === 'register'
                ? 'bg-accent text-accent-foreground shadow-xs'
                : 'text-text-secondary'
            )}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {error && (
            <div className="px-3.5 py-2.5 rounded-xl bg-danger-bg border border-danger-border text-danger text-xs font-medium">
              {error}
            </div>
          )}

          {mode === 'register' && (
            <div className="relative flex items-center">
              <UserIcon className="w-4 h-4 text-text-secondary absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                required
                maxLength={50}
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-12 pl-10 pr-3.5 rounded-xl bg-bg-secondary border border-border-subtle text-sm focus:border-accent outline-none transition"
              />
            </div>
          )}

          <div className="relative flex items-center">
            <Mail className="w-4 h-4 text-text-secondary absolute left-3.5 pointer-events-none" />
            <input
              type="email"
              required
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 pl-10 pr-3.5 rounded-xl bg-bg-secondary border border-border-subtle text-sm focus:border-accent outline-none transition"
            />
          </div>

          <div className="relative flex items-center">
            <Lock className="w-4 h-4 text-text-secondary absolute left-3.5 pointer-events-none" />
            <input
              type={showPass ? 'text' : 'password'}
              required
              minLength={6}
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 pl-10 pr-11 rounded-xl bg-bg-secondary border border-border-subtle text-sm focus:border-accent outline-none transition"
            />
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              aria-label={showPass ? 'Hide password' : 'Show password'}
              className="w-8 h-8 rounded-lg absolute right-2.5 flex items-center justify-center text-text-secondary hover:text-text-primary"
            >
              {showPass ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          <MathCaptcha
            onVerifyChange={setCaptchaValid}
            resetTrigger={captchaReset}
          />

          <button
            type="submit"
            disabled={loading}
            className="h-12 mt-1 rounded-xl bg-accent hover:bg-accent-hover text-accent-foreground text-sm font-bold shadow-lg shadow-violet-600/20 active:scale-[0.98] disabled:opacity-60 transition flex items-center justify-center gap-2"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
            <span>
              {loading
                ? mode === 'login'
                  ? 'Signing in...'
                  : 'Creating account...'
                : mode === 'login'
                  ? 'Sign In'
                  : 'Create Account'}
            </span>
          </button>
        </form>
      </div>

      {/* Footer GitHub Pill */}
      <div className="pb-2 flex justify-center">
        <GitHubPill />
      </div>
    </div>
  );
}
