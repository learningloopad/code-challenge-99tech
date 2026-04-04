import { useState } from 'react';
import { ArrowDownUp } from 'lucide-react';
import CurrencyInput from '../../components/CurrencyInput';
import { Skeleton } from '../../components/ui/skeleton';
import { useFetchPrices } from './api/queries';

export default function SwapForm() {
  const [payAmount, setPayAmount] = useState('');
  const [payCurrency, setPayCurrency] = useState('USDC');
  const [receiveCurrency, setReceiveCurrency] = useState('SWTH');

  const { data, isLoading: pricesLoading } = useFetchPrices();
  const currencies = data?.currencies ?? [];

  const handleSwap = () => {
    setPayCurrency(receiveCurrency);
    setReceiveCurrency(payCurrency);
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
            onAmountChange={setPayAmount}
            onCurrencyChange={setPayCurrency}
            options={currencies}
          />
          
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <button 
              type="button" 
              className="flex size-10 items-center justify-center rounded-full border-4 border-[#131722] bg-[#1a1e2e] text-[#f3f4f6] transition-colors hover:bg-[#2a3143] hover:text-[#fcee0a]"
              onClick={handleSwap}
            >
              <ArrowDownUp size={20} />
            </button>
          </div>

          <CurrencyInput 
            amount=""
            currency={receiveCurrency}
            onAmountChange={() => {}}
            onCurrencyChange={setReceiveCurrency}
            options={currencies}
            readOnlyAmount
          />
        </div>
      )}
    </form>
  );
}
