import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { fetchPokemon, pokemonQueryKey } from "./usePokemon";
import { fetchSpecies, speciesQueryKey } from "./useSpecies";
import { fetchTypeIconMap, TYPE_ICON_MAP_KEY } from "./useTypeIconMap";
import { artworkUrl, cachedImage, preloadImage } from "../utils/cachedImage";

const idFromUrl = (url) => url.match(/(?<=\/pokemon\/)(\d+|\d)/gm)?.[0];

function usePrefetchGen() {
  const queryClient = useQueryClient();

  const prefetchOne = useCallback(
    async (poke) => {
      const id = idFromUrl(poke.url);

      // Detalle del pokémon base, su especie y el artwork del base, en paralelo.
      const [, species] = await Promise.all([
        queryClient.fetchQuery({
          queryKey: pokemonQueryKey(id),
          queryFn: fetchPokemon,
        }),
        queryClient.fetchQuery({
          queryKey: speciesQueryKey(id),
          queryFn: fetchSpecies,
        }),
        preloadImage(cachedImage(artworkUrl(id), 100)),
      ]);

      // Precarga los artworks de las formas alternativas (imágenes baratas):
      // así al seleccionar una forma la imagen aparece sin esperas.
      await Promise.all(
        species.varieties
          .filter((v) => !v.isDefault)
          .map((v) => preloadImage(cachedImage(artworkUrl(v.id), 100)))
      );
    },
    [queryClient]
  );

  // Carga el tramo entero; resuelve sólo cuando TODO está listo.
  return useCallback(
    async (tramo) => {
      // Los iconos de tipo se piden UNA sola vez (sólo hay 18). fetchQuery con
      // staleTime: Infinity no re-pide si ya está cacheado de un tramo previo.
      const typeIconMap = await queryClient.fetchQuery({
        queryKey: TYPE_ICON_MAP_KEY,
        queryFn: fetchTypeIconMap,
        staleTime: Infinity,
      });

      const iconPreloads = Object.values(typeIconMap).map(preloadImage);

      await Promise.all([...iconPreloads, ...tramo.map(prefetchOne)]);
    },
    [queryClient, prefetchOne]
  );
}

export default usePrefetchGen;
