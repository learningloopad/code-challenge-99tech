import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useFetchIcons } from '../modules/swap-form/api/queries';
import { Skeleton } from './ui/skeleton';

interface CurrencyInputProps {
  amount: string;
  currency: string;
  onAmountChange: (amount: string) => void;
  onCurrencyChange: (currency: string) => void;
  options: string[];
  readOnly?: boolean;
}

export default function CurrencyInput({
  amount,
  currency,
  onAmountChange,
  onCurrencyChange,
  options,
  readOnly = false
}: CurrencyInputProps) {
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const { data: iconSvg, isLoading: isIconLoading } = useFetchIcons(currency);
  const iconSrc = iconSvg ? `data:image/svg+xml;utf8,${encodeURIComponent(iconSvg)}` : '';

  const formatAmountForDisplay = (rawAmount: string) => {
    if (!rawAmount) {
      return '';
    }

    const parsedAmount = Number(rawAmount);
    if (!Number.isFinite(parsedAmount)) {
      return rawAmount;
    }

    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 6,
    }).format(parsedAmount);
  };

  const displayAmount = readOnly || !isAmountFocused
    ? formatAmountForDisplay(amount)
    : amount;

  return (
    <div className="relative rounded-2xl border border-transparent bg-[#1a1e2e] px-5 py-4 transition-colors focus-within:border-[#3b4255] focus-within:bg-[#1e2335]">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex min-w-max cursor-pointer items-center rounded-full bg-[#2a3143] px-3 py-1.5 pl-2 transition-colors hover:bg-[#343c51]">
          <div className="mr-2 flex size-6 items-center justify-center overflow-hidden rounded-full bg-[#4b5563]">
            {currency && isIconLoading ? (
              <Skeleton className="size-full rounded-full bg-[#6b7280]" />
            ) : currency && iconSrc ? (
              <img src={iconSrc} alt={currency} />
            ) : (
              <div className="size-full rounded-full bg-[#4b5563]" />
            )}
          </div>
          <select 
            className="absolute inset-0 size-full cursor-pointer appearance-none opacity-0"
            value={currency} 
            onChange={(e) => onCurrencyChange(e.target.value)}
          >
            <option value="" disabled>Select</option>
            {options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <div className="pointer-events-none flex items-center gap-2 text-lg font-semibold text-white">
            {currency || 'Select'}
            <ChevronDown size={20} className="text-[#9ca3af]" />
          </div>
        </div>
        <input 
          type="text"
          inputMode="decimal"
          className="w-full appearance-none bg-transparent p-0 text-right text-[28px] font-medium text-white placeholder:text-[#4b5563] focus:outline-none read-only:text-[#c7cedd] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          placeholder="0"
          value={displayAmount}
          readOnly={readOnly}
          onFocus={() => {
            if (!readOnly) {
              setIsAmountFocused(true);
            }
          }}
          onBlur={() => setIsAmountFocused(false)}
          onKeyDown={(e) => {
            if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === ',') {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            if (readOnly) {
              return;
            }

            onAmountChange(e.target.value.replace(/,/g, ''));
          }}
        />
      </div>
    </div>
  );
}
