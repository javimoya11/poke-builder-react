import usePokedex from "./usePokedex";
import { useQuery } from "@tanstack/react-query";

export const TYPE_ICON_MAP_KEY = ["type-icon-map"];

const iconFromSprites = (detail) => {
  const genViii = detail.sprites?.["generation-viii"] ?? {};
  return (
    genViii["brilliant-diamond-shining-pearl"]?.name_icon ??
    Object.values(genViii).find((set) => set?.name_icon)?.name_icon ??
    null
  );
};

export async function fetchTypeIconMap() {
  const pokedex = usePokedex();

  const list = await pokedex.getTypesList({ offset: 0, limit: 18 });
  if (!list?.results) {
    throw new Error(`type list not okay`);
  }

  const urls = list.results.map((type) => type.url);
  const details = await pokedex.resource(urls);

  const map = {};
  urls.forEach((url, i) => {
    map[url] = iconFromSprites(details[i]);
  });
  return map;
}

export const useTypeIconMap = (options = {}) =>
  useQuery({
    queryKey: TYPE_ICON_MAP_KEY,
    queryFn: fetchTypeIconMap,
    staleTime: Infinity,
    ...options,
  });
