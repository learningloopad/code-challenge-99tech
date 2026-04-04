import { useQuery } from '@tanstack/react-query';

import { currencyApi } from '../../../api/currency';

export const useFetchPrices = () =>
  useQuery({
    queryKey: ['prices'],
    queryFn: currencyApi.fetchPrices,
    staleTime: 0,
  });

export const useFetchIcons = (currency: string) =>
  useQuery({
    queryKey: ['icons', currency],
    queryFn: () => currencyApi.fetchIcons(currency),
    enabled: Boolean(currency),
    staleTime: 60_000,
  });
