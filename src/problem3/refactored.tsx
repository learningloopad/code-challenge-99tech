interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string; // was missing from original
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

// Moved outside component — pure function, no need to recreate on every render
const BLOCKCHAIN_PRIORITY: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

const getPriority = (blockchain: string): number =>
  BLOCKCHAIN_PRIORITY[blockchain] ?? -99;

// Props doesn't need a separate empty interface — just use BoxProps directly
const WalletPage: React.FC<BoxProps> = ({ children, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo(() => {
    return balances
      .filter((balance: WalletBalance) => {
        // Fixed: use balancePriority (not lhsPriority), and correct the condition
        // to keep balances with positive amounts and a valid priority
        const priority = getPriority(balance.blockchain);
        return priority > -99 && balance.amount > 0;
      })
      .sort((lhs: WalletBalance, rhs: WalletBalance) => {
        const leftPriority = getPriority(lhs.blockchain);
        const rightPriority = getPriority(rhs.blockchain);
        // Fixed: return 0 for equal priorities instead of undefined
        return rightPriority - leftPriority;
      });
  }, [balances]); // Fixed: removed prices, it was never used here

  // Fixed: actually use formattedBalances when rendering rows
  const formattedBalances = useMemo(
    (): FormattedWalletBalance[] =>
      sortedBalances.map((balance) => ({
        ...balance,
        formatted: balance.amount.toFixed(2), // Fixed: toFixed(2) not toFixed()
      })),
    [sortedBalances],
  );

  // Fixed: memoized, uses formattedBalances (not sortedBalances), uses currency as key
  const rows = useMemo(
    () =>
      formattedBalances.map((balance: FormattedWalletBalance) => {
        const usdValue = prices[balance.currency] * balance.amount;
        return (
          <WalletRow
            className={classes.row}
            key={`${balance.blockchain}-${balance.currency}`}
            amount={balance.amount}
            usdValue={usdValue}
            formattedAmount={balance.formatted}
          />
        );
      }),
    [formattedBalances, prices],
  );

  return (
    <div {...rest}>
      {children} {/* Fixed: actually render children */}
      {rows}
    </div>
  );
};