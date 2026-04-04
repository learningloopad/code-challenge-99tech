import { useState } from 'react';
import { ArrowDownUp } from 'lucide-react';
import CurrencyInput from '../../components/CurrencyInput';
import { Skeleton } from '../../components/ui/skeleton';
import { useFetchPrices } from './api/queries';
import './SwapForm.css';

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
    <form className="swap-form-container">
      <div className="swap-header">
        <h2>Currency Swap</h2>
        <p className="swap-subtitle">Live quote based on latest available token prices.</p>
      </div>

      {pricesLoading ? (
        <div className="inputs-wrapper">
          <Skeleton className="h-[76px] w-full rounded-2xl bg-[#1a1e2e] mb-1" />
          <Skeleton className="h-[76px] w-full rounded-2xl bg-[#1a1e2e]" />
        </div>
      ) : (
        <div className="inputs-wrapper">
          <CurrencyInput 
            amount={payAmount}
            currency={payCurrency}
            onAmountChange={setPayAmount}
            onCurrencyChange={setPayCurrency}
            options={currencies}
          />
          
          <div className="swap-button-container">
            <button 
              type="button" 
              className="swap-button"
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
