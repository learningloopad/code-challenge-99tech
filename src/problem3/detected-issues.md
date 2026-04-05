# Detected Issues in WalletPage

## 1) Undefined variable `lhsPriority` (runtime crash)

What is happening:
In the filter callback, `balancePriority` is calculated, but `lhsPriority` is used in the condition. Since `lhsPriority` is never defined, this will throw at runtime.

Suggested fix:
Use `balancePriority` consistently and double-check that every variable in the callback is declared in scope.

## 2) Filter logic is flipped (incorrect behavior)

What is happening:
The current filter keeps balances where `amount <= 0`, which means zero or negative balances are kept while positive balances are removed. That is usually the opposite of what a wallet view needs.

Suggested fix:
Keep balances only when priority is valid and amount is positive, for example: `priority > -99 && amount > 0`.

## 3) `WalletBalance` type is missing `blockchain`

What is happening:
`WalletBalance` only includes `currency` and `amount`, but the code reads `balance.blockchain` in both filter and sort. Runtime usage and type definition do not match.

Suggested fix:
Add `blockchain` to `WalletBalance` (or inherit from a base type that already defines it).

## 4) `getPriority` parameter is typed as `any`

What is happening:
`getPriority(blockchain: any)` turns off useful type checking for that argument.

Suggested fix:
Type it as `string`.

## 5) `getPriority` is recreated every render

What is happening:
`getPriority` is a pure helper, but it is declared inside the component, so React recreates it on each render.

Suggested fix:
Move it outside the component (or memoize it if needed).

## 6) Unused `useMemo` dependency: `prices`

What is happening:
`prices` is listed in the dependency array for `sortedBalances`, but it is not actually used inside that memo callback. This causes unnecessary recomputation.

Suggested fix:
Remove `prices` from that dependency list and keep only values referenced in the memo body.

## 7) Sort comparator is not exhaustive

What is happening:
When priorities are equal, the comparator returns nothing. A comparator should always return a number.

Suggested fix:
Return `0` for equality, or use a single numeric expression such as `rightPriority - leftPriority`.

## 8) `formattedBalances` is computed but never used

What is happening:
`formattedBalances` is created, but rendering still maps over `sortedBalances`. So the formatted values are not used by the UI.

Suggested fix:
Render rows from `formattedBalances`, or remove that step if formatting is unnecessary.

## 9) Data/type mismatch when mapping rows

What is happening:
Rows are mapped from `sortedBalances` but the item is annotated as `FormattedWalletBalance`. Those objects do not contain `formatted`, so this is both a typing issue and a logic mismatch.

Suggested fix:
Only use `FormattedWalletBalance` after the `formatted` field has actually been added.

## 10) Unstable list key: `index`

What is happening:
Using `key={index}` in a sortable list can break React reconciliation when items move.

Suggested fix:
Use a stable unique key from the data, such as `blockchain + currency`.

## 11) `toFixed()` called without explicit precision

What is happening:
Calling `toFixed()` with no argument defaults to `0` decimals, which can over-round values (for example `1.5` becomes `"2"`).

Suggested fix:
Use explicit precision like `toFixed(2)`, or locale-aware formatting for money values.

## 12) Mapping work repeats on every render

What is happening:
`formattedBalances` and `rows` are built with plain `.map(...)` outside memoization, so both recompute every render.

Suggested fix:
Wrap derived arrays in `useMemo` with correct dependencies if this becomes a measurable render cost.

## 13) `children` prop is unused

What is happening:
`children` is destructured from props but never rendered.

Suggested fix:
Render `{children}` if composition is intended, otherwise remove it from the component contract.