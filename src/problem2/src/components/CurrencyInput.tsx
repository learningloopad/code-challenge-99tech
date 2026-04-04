import './CurrencyInput.css';
import { ChevronDown } from 'lucide-react';

interface CurrencyInputProps {
  amount: string;
  currency: string;
  onAmountChange: (amount: string) => void;
  onCurrencyChange: (currency: string) => void;
  options: string[];
  readOnlyAmount?: boolean;
}

export default function CurrencyInput({
  amount,
  currency,
  onAmountChange,
  onCurrencyChange,
  options,
  readOnlyAmount = false
}: CurrencyInputProps) {
  // Use user-provided repo for token icons
  const getTokenIconUrl = (symbol: string) => `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${symbol}.svg`;

  return (
    <div className="currency-input-container">
      <div className="input-row">
        <div className="dropdown-container">
          <div className="token-icon">
            {currency ? (
              <img src={getTokenIconUrl(currency)} alt={currency} onError={(e) => (e.currentTarget.style.display = 'none')} />
            ) : (
              <div className="token-icon-placeholder" />
            )}
          </div>
          <select 
            className="currency-select"
            value={currency} 
            onChange={(e) => onCurrencyChange(e.target.value)}
          >
            <option value="" disabled>Select</option>
            {options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <div className="dropdown-overlay">
            {currency || 'Select'}
            <ChevronDown size={20} className="overlay-chevron" />
          </div>
        </div>
        <input 
          type="number"
          className="amount-input"
          placeholder="0"
          value={amount}
          min="0"
          step="any"
          readOnly={readOnlyAmount}
          onChange={(e) => onAmountChange(e.target.value)}
        />
      </div>
    </div>
  );
}
