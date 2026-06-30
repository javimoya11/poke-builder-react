import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { Item } from 'pokeapi-js-wrapper';
import { getPokedex } from './getPokedex';

export const itemQueryKey = (name?: string) => ['item', { name }] as const;

type ItemQueryKey = ReturnType<typeof itemQueryKey>;

async function fetchItem({
  queryKey
}: QueryFunctionContext<ItemQueryKey>): Promise<Item> {
  const [, { name }] = queryKey;
  if (!name) throw new Error('item name required');
  const pokedex = getPokedex();
  return pokedex.getItemByName(name);
}

type ItemQueryOptions = Omit<
  UseQueryOptions<Item, Error, Item, ItemQueryKey>,
  'queryKey' | 'queryFn'
>;

export const useItem = (name?: string, options: ItemQueryOptions = {}) =>
  useQuery({
    queryKey: itemQueryKey(name),
    queryFn: fetchItem,
    staleTime: Infinity,
    enabled: !!name,
    ...options
  });
