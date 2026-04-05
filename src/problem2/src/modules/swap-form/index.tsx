import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownUp, CheckCircle2, Loader2 } from 'lucide-react';
import CurrencyInput from '../../components/CurrencyInput';
import { Skeleton } from '../../components/ui/skeleton';
import { useFetchPrices } from './api/queries';
import {
  formatUsdValue,
  getReceiveAmount,
  getUsdNotional,
  getValidatedPayAmount,
} from './lib/utils';

export default function SwapForm() {
  const [payAmount, setPayAmount] = useState('');
  const [payCurrency, setPayCurrency] = useState('');
  const [receiveCurrency, setReceiveCurrency] = useState('');
  const [swapButtonRotate, setSwapButtonRotate] = useState(false);
  const [isQuoteRefreshing, setIsQuoteRefreshing] = useState(false);
  const [swapActionState, setSwapActionState] = useState<
    'idle' | 'loading' | 'success'
  >('idle');
  const swapActionTimeoutRef = useRef<number | null>(null);

  const {
    data,
    isLoading: pricesLoading,
    isError: pricesError,
    error,
    isFetching: pricesFetching,
    refetch: refetchPrices,
  } = useFetchPrices();
  const currencies = useMemo(() => data?.currencies ?? [], [data?.currencies]);
  const prices = useMemo(() => data?.prices ?? {}, [data?.prices]);
  const resolvedPayCurrency = payCurrency || currencies[0] || '';
  const resolvedReceiveCurrency =
    receiveCurrency || currencies[1] || currencies[0] || '';

  useEffect(() => {
    if (!payAmount || pricesLoading) {
      setIsQuoteRefreshing(false);
      return;
    }

    setIsQuoteRefreshing(true);

    const timeoutId = window.setTimeout(async () => {
      try {
        await refetchPrices();
      } finally {
        setIsQuoteRefreshing(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [payAmount, pricesLoading, refetchPrices]);

  useEffect(
    () => () => {
      if (swapActionTimeoutRef.current) {
        window.clearTimeout(swapActionTimeoutRef.current);
      }
    },
    [],
  );

  const handlePayAmountChange = (nextAmount: string) => {
    if (swapActionState === 'success') {
      setSwapActionState('idle');
    }

    const validatedAmount = getValidatedPayAmount(nextAmount);
    if (validatedAmount === null) {
      return;
    }

    if (validatedAmount === '') {
      setIsQuoteRefreshing(false);
    }

    setPayAmount(validatedAmount);
  };

  const receiveAmount = getReceiveAmount(
    payAmount,
    resolvedPayCurrency,
    resolvedReceiveCurrency,
    prices,
  );

  const usdNotional = getUsdNotional(payAmount, resolvedPayCurrency, prices);
  const usdValue = usdNotional === null ? '$0' : formatUsdValue(usdNotional);

  const handleSwap = () => {
    setPayCurrency(resolvedReceiveCurrency);
    setReceiveCurrency(resolvedPayCurrency);
    setPayAmount('');
    setSwapButtonRotate((prev) => !prev);
  };

  const handlePayCurrencyChange = (nextCurrency: string) => {
    if (swapActionState === 'success') {
      setSwapActionState('idle');
    }

    if (nextCurrency === resolvedReceiveCurrency) {
      handleSwap();
      return;
    }
    setPayCurrency(nextCurrency);
  };

  const handleReceiveCurrencyChange = (nextCurrency: string) => {
    if (swapActionState === 'success') {
      setSwapActionState('idle');
    }

    if (nextCurrency === resolvedPayCurrency) {
      handleSwap();
      return;
    }
    setReceiveCurrency(nextCurrency);
  };

  const canSubmitSwap =
    !pricesLoading &&
    !pricesError &&
    swapActionState !== 'loading' &&
    Number(payAmount) > 0 &&
    Boolean(resolvedPayCurrency) &&
    Boolean(resolvedReceiveCurrency);

  const handleSubmitSwap = () => {
    if (!canSubmitSwap) {
      return;
    }

    setSwapActionState('loading');

    if (swapActionTimeoutRef.current) {
      window.clearTimeout(swapActionTimeoutRef.current);
    }

    swapActionTimeoutRef.current = window.setTimeout(() => {
      setSwapActionState('success');
      setPayAmount('');
      setIsQuoteRefreshing(false);
      swapActionTimeoutRef.current = null;
    }, 1500);
  };

  return (
    <form className="flex flex-col rounded-2xl bg-[#131722] p-2.5 shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)] sm:rounded-3xl sm:p-3">
      <div className="px-2 py-2.5 sm:px-4 sm:py-3">
        <h2 className="m-0 text-base font-semibold text-[#f3f4f6]">
          Currency Swap
        </h2>
        <p className="mt-1.5 text-[13px] text-[#94a3b8]">
          Live quote based on latest available token prices.
        </p>
      </div>

      {pricesLoading ? (
        <div className="relative mb-2 flex flex-col gap-1">
          <Skeleton className="mb-1 h-[96px] w-full rounded-2xl bg-[#1a1e2e] sm:h-[104px]" />
          <Skeleton className="h-[96px] w-full rounded-2xl bg-[#1a1e2e] sm:h-[104px]" />
        </div>
      ) : pricesError ? (
        <div className="mb-2 rounded-2xl bg-[#1a1e2e] px-4 py-5 text-center sm:px-5 sm:py-6">
          <p className="text-sm font-medium text-[#fca5a5]">
            Unable to load live prices right now.
          </p>
          <p className="mt-1 text-xs text-[#94a3b8]">
            {error instanceof Error ? error.message : 'Please try again.'}
          </p>
          <button
            type="button"
            className="mt-4 rounded-lg bg-[#2a3143] px-4 py-2 text-sm font-semibold text-[#f3f4f6] transition-colors hover:bg-[#343c51]"
            onClick={() => {
              void refetchPrices();
            }}
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="mb-2 flex flex-col">
          <div className="relative">
            <CurrencyInput
              amount={payAmount}
              currency={resolvedPayCurrency}
              onAmountChange={handlePayAmountChange}
              onCurrencyChange={handlePayCurrencyChange}
              options={currencies}
              usdValue={usdValue}
            />

            <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2">
              <button
                type="button"
                className="flex size-9 items-center justify-center rounded-full border-[3px] border-[#131722] bg-[#1a1e2e] text-[#f3f4f6] transition-colors hover:bg-[#2a3143] hover:text-[#fcee0a] sm:size-10 sm:border-4"
                onClick={handleSwap}
              >
                <span
                  className="transition-transform duration-300 ease-in-out"
                  style={{
                    transform: `rotate(${swapButtonRotate ? 180 : 0}deg)`,
                  }}
                >
                  <ArrowDownUp size={20} />
                </span>
              </button>
            </div>
          </div>

          <div className="mt-1">
            <CurrencyInput
              amount={receiveAmount}
              currency={resolvedReceiveCurrency}
              onAmountChange={() => {}}
              onCurrencyChange={handleReceiveCurrencyChange}
              options={currencies}
              usdValue={usdValue}
              isAmountLoading={isQuoteRefreshing || pricesFetching}
              readOnly
            />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmitSwap}
        disabled={!canSubmitSwap}
        className="mt-3 flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#fcee0a] via-[#f8d419] to-[#f59e0b] px-4 text-sm font-bold text-[#0e111a] shadow-[0_10px_24px_rgba(245,158,11,0.35)] transition-all duration-200 hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:h-12"
      >
        {swapActionState === 'loading' ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Swapping...
          </>
        ) : swapActionState === 'success' ? (
          <>
            <CheckCircle2 size={16} />
            Swap confirmed!
          </>
        ) : (
          'Swap'
        )}
      </button>
    </form>
  );
}
