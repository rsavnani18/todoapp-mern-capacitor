import { useState } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';

interface MathCaptchaProps {
  onVerifyChange: (isValid: boolean) => void;
}

function generateChallenge() {
  const num1 = Math.floor(Math.random() * 12) + 2; // 2..13
  const num2 = Math.floor(Math.random() * 10) + 1; // 1..10
  return {
    question: `${num1} + ${num2}`,
    answer: num1 + num2,
  };
}

export function MathCaptcha({ onVerifyChange }: MathCaptchaProps) {
  const [challenge, setChallenge] = useState(generateChallenge);
  const [userInput, setUserInput] = useState('');

  const refreshChallenge = () => {
    setChallenge(generateChallenge());
    setUserInput('');
    onVerifyChange(false);
  };

  const handleChange = (val: string) => {
    setUserInput(val);
    const parsed = Number(val.trim());
    onVerifyChange(val.trim() !== '' && parsed === challenge.answer);
  };

  return (
    <div className="captcha-box">
      <div className="captcha-prompt">
        <ShieldCheck size={16} className="captcha-icon" />
        <span className="captcha-question">{challenge.question} = ?</span>
        <button
          type="button"
          className="captcha-refresh"
          onClick={refreshChallenge}
          aria-label="New math captcha"
          title="Refresh captcha"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <input
        type="number"
        inputMode="numeric"
        className="captcha-input"
        placeholder="Ans"
        value={userInput}
        onChange={(e) => handleChange(e.target.value)}
        required
      />
    </div>
  );
}
