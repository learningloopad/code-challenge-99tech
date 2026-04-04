import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownUp, CheckCircle2, Loader2 } from 'lucide-react';
import CurrencyInput from '../../components/CurrencyInput';
import { Skeleton } from '../../components/ui/skeleton';
import { useFetchPrices } from './api/queries';

const MAX_INPUT_AMOUNT = 1_000_000_000_000;
const MAX_INPUT_DECIMALS = 6;
const AMOUNT_FORMAT = /^\d*\.?\d*$/;

export default function SwapForm() {
  const [payAmount, setPayAmount] = useState('');
  const [payCurrency, setPayCurrency] = useState('');
  const [receiveCurrency, setReceiveCurrency] = useState('');
  const [swapButtonRotate, setSwapButtonRotate] = useState(false);
  const [isQuoteRefreshing, setIsQuoteRefreshing] = useState(false);
  const [hasInitializedCurrencies, setHasInitializedCurrencies] =
    useState(false);
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

  useEffect(() => {
    if (hasInitializedCurrencies || currencies.length === 0) {
      return;
    }

    setPayCurrency(currencies[0]);
    setReceiveCurrency(currencies[1] ?? currencies[0]);
    setHasInitializedCurrencies(true);
  }, [currencies, hasInitializedCurrencies]);

  const formatUsdValue = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

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

    if (nextAmount === '') {
      setPayAmount('');
      setIsQuoteRefreshing(false);
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

  const payUsdValue = (() => {
    const parsedPayAmount = Number(payAmount);
    const payPrice = prices[payCurrency];

    if (
      !Number.isFinite(parsedPayAmount) ||
      parsedPayAmount <= 0 ||
      !Number.isFinite(payPrice)
    ) {
      return '$0';
    }

    return formatUsdValue(parsedPayAmount * payPrice);
  })();

  const handleSwap = () => {
    setPayCurrency(receiveCurrency);
    setReceiveCurrency(payCurrency);
    setPayAmount('');
    setSwapButtonRotate((prev) => !prev);
  };

  const handlePayCurrencyChange = (nextCurrency: string) => {
    if (swapActionState === 'success') {
      setSwapActionState('idle');
    }

    if (nextCurrency === receiveCurrency) {
      handleSwap();
      return;
    }
    setPayCurrency(nextCurrency);
  };

  const handleReceiveCurrencyChange = (nextCurrency: string) => {
    if (swapActionState === 'success') {
      setSwapActionState('idle');
    }

    if (nextCurrency === payCurrency) {
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
    Boolean(payCurrency) &&
    Boolean(receiveCurrency);

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
    <form className="flex flex-col rounded-3xl bg-[#131722] p-3 shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)]">
      <div className="px-4 py-3">
        <h2 className="m-0 text-base font-semibold text-[#f3f4f6]">
          Currency Swap
        </h2>
        <p className="mt-1.5 text-[13px] text-[#94a3b8]">
          Live quote based on latest available token prices.
        </p>
      </div>

      {pricesLoading ? (
        <div className="relative mb-2 flex flex-col gap-1">
          <Skeleton className="mb-1 h-[104px] w-full rounded-2xl bg-[#1a1e2e]" />
          <Skeleton className="h-[104px] w-full rounded-2xl bg-[#1a1e2e]" />
        </div>
      ) : pricesError ? (
        <div className="mb-2 rounded-2xl bg-[#1a1e2e] px-5 py-6 text-center">
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
              currency={payCurrency}
              onAmountChange={handlePayAmountChange}
              onCurrencyChange={handlePayCurrencyChange}
              options={currencies}
              usdValue={payUsdValue}
            />

            <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2">
              <button
                type="button"
                className="flex size-10 items-center justify-center rounded-full border-4 border-[#131722] bg-[#1a1e2e] text-[#f3f4f6] transition-colors hover:bg-[#2a3143] hover:text-[#fcee0a]"
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
              currency={receiveCurrency}
              onAmountChange={() => {}}
              onCurrencyChange={handleReceiveCurrencyChange}
              options={currencies}
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
        className="mt-3 flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#fcee0a] via-[#f8d419] to-[#f59e0b] px-4 text-sm font-bold text-[#0e111a] shadow-[0_10px_24px_rgba(245,158,11,0.35)] transition-all duration-200 hover:brightness-105 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
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
