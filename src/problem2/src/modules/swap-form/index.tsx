import { useState } from 'react';
import { ArrowDownUp } from 'lucide-react';
import CurrencyInput from '../../components/CurrencyInput';
import { Skeleton } from '../../components/ui/skeleton';
import { useFetchPrices } from './api/queries';

const MAX_INPUT_AMOUNT = 1_000_000_000_000;
const MAX_INPUT_DECIMALS = 6;
const AMOUNT_FORMAT = /^\d*\.?\d*$/;

export default function SwapForm() {
  const [payAmount, setPayAmount] = useState('');
  const [payCurrency, setPayCurrency] = useState('USDC');
  const [receiveCurrency, setReceiveCurrency] = useState('SWTH');
  const [swapButtonRotate, setSwapButtonRotate] = useState(false);

  const { data, isLoading: pricesLoading } = useFetchPrices();
  const currencies = data?.currencies ?? [];
  const prices = data?.prices ?? {};

  const handlePayAmountChange = (nextAmount: string) => {
    if (nextAmount === '') {
      setPayAmount('');
      return;
    }

    if (!AMOUNT_FORMAT.test(nextAmount)) {
      return;
    }

    const [, decimalPart = ''] = nextAmount.split('.');
    if (decimalPart.length > MAX_INPUT_DECIMALS) {
      return;
    }

    const parsedAmount = Number(nextAmount);
    if (!Number.isFinite(parsedAmount)) {
      return;
    }

    if (parsedAmount > MAX_INPUT_AMOUNT) {
      setPayAmount(String(MAX_INPUT_AMOUNT));
      return;
    }

    setPayAmount(nextAmount);
  };

  const receiveAmount = (() => {
    const parsedPayAmount = Number(payAmount);
    const payPrice = prices[payCurrency];
    const receivePrice = prices[receiveCurrency];

    if (
      !Number.isFinite(parsedPayAmount) ||
      parsedPayAmount <= 0 ||
      !Number.isFinite(payPrice) ||
      !Number.isFinite(receivePrice) ||
      receivePrice <= 0
    ) {
      return '';
    }

    const calculatedAmount = (parsedPayAmount * payPrice) / receivePrice;
    return Number.isFinite(calculatedAmount)
      ? calculatedAmount.toFixed(6).replace(/\.?0+$/, '')
      : '';
  })();

  const handleSwap = () => {
    setPayCurrency(receiveCurrency);
    setReceiveCurrency(payCurrency);
    setPayAmount('');
    setSwapButtonRotate((prev) => !prev);

  };

  return (
    <form className="flex flex-col rounded-3xl bg-[#131722] p-3 shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)]">
      <div className="px-4 py-3">
        <h2 className="m-0 text-base font-semibold text-[#f3f4f6]">Currency Swap</h2>
        <p className="mt-1.5 text-[13px] text-[#94a3b8]">Live quote based on latest available token prices.</p>
      </div>

      {pricesLoading ? (
        <div className="relative mb-2 flex flex-col gap-1">
          <Skeleton className="h-[76px] w-full rounded-2xl bg-[#1a1e2e] mb-1" />
          <Skeleton className="h-[76px] w-full rounded-2xl bg-[#1a1e2e]" />
        </div>
      ) : (
        <div className="relative mb-2 flex flex-col gap-1">
          <CurrencyInput 
            amount={payAmount}
            currency={payCurrency}
            onAmountChange={handlePayAmountChange}
            onCurrencyChange={setPayCurrency}
            options={currencies}
          />
          
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <button 
              type="button" 
              className="flex size-10 items-center justify-center rounded-full border-4 border-[#131722] bg-[#1a1e2e] text-[#f3f4f6] transition-colors hover:bg-[#2a3143] hover:text-[#fcee0a]"
              onClick={handleSwap}
            >
              <span
                className="transition-transform duration-300 ease-in-out"
                style={{ transform: `rotate(${swapButtonRotate ? 180 : 0}deg)` }}
              >
                <ArrowDownUp size={20} />
              </span>
            </button>
          </div>

          <CurrencyInput 
            amount={receiveAmount}
            currency={receiveCurrency}
            onAmountChange={() => {}}
            onCurrencyChange={setReceiveCurrency}
            options={currencies}
            readOnly
          />
        </div>
      )}
    </form>
  );
}
