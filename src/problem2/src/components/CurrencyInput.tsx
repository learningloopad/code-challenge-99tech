import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useFetchIcons } from '../modules/swap-form/api/queries';
import { Skeleton } from './ui/skeleton';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface CurrencyInputProps {
  amount: string;
  currency: string;
  onAmountChange: (amount: string) => void;
  onCurrencyChange: (currency: string) => void;
  options: string[];
  usdValue?: string;
  isAmountLoading?: boolean;
  readOnly?: boolean;
}

export default function CurrencyInput({
  amount,
  currency,
  onAmountChange,
  onCurrencyChange,
  options,
  usdValue,
  isAmountLoading = false,
  readOnly = false,
}: CurrencyInputProps) {
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);
  const { data: iconSvg, isLoading: isIconLoading } = useFetchIcons(currency);
  const iconSrc = iconSvg
    ? `data:image/svg+xml;utf8,${encodeURIComponent(iconSvg)}`
    : '';

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

  const displayAmount =
    readOnly || !isAmountFocused ? formatAmountForDisplay(amount) : amount;
  const showUsdValue = typeof usdValue === 'string';

  return (
    <div className="relative rounded-2xl border border-transparent bg-[#1a1e2e] px-6 py-5 transition-colors focus-within:border-[#3b4255] focus-within:bg-[#1e2335]">
      <div className="flex items-center justify-between gap-4">
        <Popover open={isCurrencyOpen} onOpenChange={setIsCurrencyOpen}>
          <PopoverTrigger
            type="button"
            className="flex min-w-max items-center rounded-full bg-[#2a3143] px-3 py-1.5 pl-2 transition-colors hover:bg-[#343c51]"
          >
            <div className="mr-2 flex size-6 items-center justify-center overflow-hidden rounded-full bg-[#4b5563]">
              {currency && isIconLoading ? (
                <Skeleton className="size-full rounded-full bg-[#6b7280]" />
              ) : currency && iconSrc ? (
                <img src={iconSrc} alt={currency} />
              ) : (
                <div className="size-full rounded-full bg-[#4b5563]" />
              )}
            </div>
            <div className="flex items-center gap-2 text-lg font-semibold text-white">
              {currency || 'Select'}
              <ChevronDown size={20} className="text-[#9ca3af]" />
            </div>
          </PopoverTrigger>
          <PopoverContent
            sideOffset={8}
            align="start"
            className="w-[240px] overflow-hidden rounded-xl border border-[#343c51] bg-[#1a1e2e] p-1 text-white"
          >
            <Command className="h-[260px] bg-transparent text-white">
              <CommandInput
                placeholder="Search currency..."
                className="text-white placeholder:text-[#9ca3af]"
              />
              <CommandList className="h-[212px]">
                <CommandEmpty className="flex h-full items-center justify-center text-[#9ca3af]">
                  No currency found.
                </CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option}
                      value={option}
                      data-checked={option === currency ? 'true' : undefined}
                      className="data-selected:bg-[#2a3143] data-selected:text-white text-[#f3f4f6]"
                      onSelect={(value) => {
                        onCurrencyChange(value);
                        setIsCurrencyOpen(false);
                      }}
                    >
                      {option}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {isAmountLoading ? (
          <div className="flex w-full flex-1 flex-col items-end gap-2">
            <Skeleton className="h-11 w-full rounded-md bg-[#6b7280]/40" />
            {showUsdValue ? (
              <Skeleton className="h-4 w-20 rounded-md bg-[#6b7280]/30" />
            ) : null}
          </div>
        ) : (
          <div className="flex w-full flex-1 flex-col items-end">
            <input
              type="text"
              inputMode="decimal"
              className="w-full appearance-none bg-transparent p-0 text-right text-[34px] font-medium leading-tight text-white placeholder:text-[#4b5563] read-only:text-[#c7cedd] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
                if (
                  e.key === '-' ||
                  e.key === 'e' ||
                  e.key === 'E' ||
                  e.key === ','
                ) {
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
            {showUsdValue ? (
              <p className="mt-1 text-right text-xs text-[#9ca3af]">
                {usdValue}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
