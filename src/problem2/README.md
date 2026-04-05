# Problem 2: Currency Swap UI

This folder contains a quote-only currency swap interface built with Vite, React, and TypeScript.

## Tech Stack

- Vite
- React 18 + TypeScript
- Tailwind CSS
- React Query
- shadcn/base-ui generated primitives

## Features

- Fetches and normalizes latest prices from:
  - `https://interview.switcheo.com/prices.json`
- Fetches token icons from Switcheo token icon repository
- Pay/receive quote calculation based on selected currencies
- Input validation:
  - numeric only
  - decimal precision limit
  - max input cap
- Debounced quote refresh when pay amount changes
  - note: we intentionally trigger price refetch on input changes even though data is sourced from a JSON endpoint, to simulate real swap behavior
- Loading skeletons for:
  - initial prices load
  - icon load
  - quote refresh
- Searchable currency dropdown
- Responsive input layout:
  - mobile: currency row and amount row are stacked on 2 lines
  - desktop: currency and amount are shown side by side
- Middle switch button for currency direction
- Cosmetic bottom Swap action:
  - click `Swap`
  - loading spinner for ~1.5 seconds
  - success state (`Swap confirmed!`)
  - pay amount resets to `0`
- Error state with retry if prices API fails

## Project Structure

- `src/modules/swap-form/index.tsx`: Main swap UI and behavior
- `src/modules/swap-form/api/queries.ts`: React Query hooks
- `src/components/CurrencyInput.tsx`: Reusable amount/currency input row
- `src/api/currency/index.ts`: Price and icon API helpers
- `src/index.css`: Tailwind + global theme/base styles

## Run Locally

From this folder:

```bash
# pnpm
pnpm install
pnpm dev

# npm
npm install
npm run dev
```

## Build and Checks

```bash
# pnpm
pnpm build
pnpm exec eslint .
pnpm format:check

# npm
npm run build
npx eslint .
npm run format:check
```

## Architecture Decisions and Trade-offs

- Data fetching with React Query:
  - Decision: use query hooks for prices/icons to manage caching, loading, and refetch states.
  - Trade-off: adds a dependency but keeps async UI logic predictable.
- Debounced quote refresh:
  - Decision: use `setTimeout`-based debounce on pay amount changes to reduce API chatter, while still refetching prices to mimic a production swap flow where quotes are refreshed as users type.
  - Trade-off: quote updates are slightly delayed by design.
- Generated UI primitives (shadcn/base-ui):
  - Decision: use generated components for consistent styling and interaction patterns.
  - Trade-off: larger dependency/UI surface than hand-rolled minimal components.

## Notes

- The bottom Swap button is intentionally cosmetic per challenge UX requirement.
