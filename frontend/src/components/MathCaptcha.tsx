import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';

interface MathCaptchaProps {
  onVerifyChange: (isValid: boolean) => void;
  resetTrigger?: number;
}

export function MathCaptcha({
  onVerifyChange,
  resetTrigger = 0,
}: MathCaptchaProps) {
  const [nums, setNums] = useState<[number, number]>([4, 3]);
  const [answer, setAnswer] = useState('');

  const regenerate = useCallback(() => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    setNums([a, b]);
    setAnswer('');
    onVerifyChange(false);
  }, [onVerifyChange]);

  useEffect(() => {
    regenerate();
  }, [regenerate, resetTrigger]);

  const handleChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    setAnswer(cleaned);
    const expected = nums[0] + nums[1];
    onVerifyChange(cleaned !== '' && Number(cleaned) === expected);
  };

  return (
    <div className="flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl bg-bg-secondary border border-border-subtle">
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-accent-text shrink-0" />
        <span className="text-sm font-bold tracking-wide select-none">
          {nums[0]} + {nums[1]} = ?
        </span>
        <button
          type="button"
          onClick={regenerate}
          aria-label="Refresh captcha"
          className="w-7 h-7 rounded-lg bg-bg-elevated text-text-secondary hover:text-accent-text flex items-center justify-center active:scale-90 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <input
        type="text"
        inputMode="numeric"
        maxLength={3}
        placeholder="Ans"
        value={answer}
        onChange={(e) => handleChange(e.target.value)}
        className="w-20 h-9 text-center font-bold text-sm rounded-lg bg-bg-elevated border border-border-subtle focus:border-accent outline-none transition"
      />
    </div>
  );
}
