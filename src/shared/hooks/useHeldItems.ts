import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { getPokedex } from './getPokedex';

export interface HeldItem {
  name: string;
  url: string;
}

export const heldItemsQueryKey = () => ['held-items'] as const;

type HeldItemsQueryKey = ReturnType<typeof heldItemsQueryKey>;

const BERRY_CATEGORIES = [
  'other',
  'in-a-pinch',
  'type-protection'
] as const;

async function fetchHeldItems(
  _ctx: QueryFunctionContext<HeldItemsQueryKey>
): Promise<HeldItem[]> {
  const pokedex = getPokedex();

  const [heldCategory, ...berryCategories] = await Promise.all([
    pokedex.getItemCategoryByName('held-items'),
    ...BERRY_CATEGORIES.map((c) => pokedex.getItemCategoryByName(c))
  ]);

  if (!heldCategory?.items) throw new Error('Failed to fetch held items');

  const toItems = (list: typeof heldCategory.items): HeldItem[] =>
    list.map((item) => ({ name: item.name, url: item.url }));

  const berries = berryCategories.flatMap((c) => toItems(c?.items ?? []));

  return [...toItems(heldCategory.items), ...berries].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
}

type HeldItemsQueryOptions = Omit<
  UseQueryOptions<HeldItem[], Error, HeldItem[], HeldItemsQueryKey>,
  'queryKey' | 'queryFn'
>;

export const useHeldItems = (options: HeldItemsQueryOptions = {}) =>
  useQuery({
    queryKey: heldItemsQueryKey(),
    queryFn: fetchHeldItems,
    staleTime: Infinity,
    ...options
  });
