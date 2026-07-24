import { Team } from 'hooks/useTeams';
import { useEffect, useMemo, useState } from 'react';
import { cachedImage, spriteUrl, toDataUrl } from 'utils/cachedImage';
import {
  useMoveTypeMap,
  useTypeIconMap
} from '../../shared/hooks/useTypeIconMap';

const SPRITE_WIDTH = 96;
const TYPE_ICON_WIDTH = 120;

/**
 * Resolves every image the export composition needs into base64 data URIs,
 * once, so both the on-screen preview and the hidden capture canvas can share
 * them. Inlining the bytes stops html-to-image from collapsing images that
 * share the wsrv.nl proxy host into a single cached one.
 * @param team - The team whose sprites and move-type icons must be resolved.
 * @returns The move/type maps, url builders, and a `resolve` that returns the
 *   data URI for a url (falling back to the url itself while it loads).
 */
export const useTeamImageData = (team: Team) => {
  const { data: moveType = {} } = useMoveTypeMap();
  const { data: typeIcon = {} } = useTypeIconMap();

  const spriteUrlFor = (pokemonId: string, shiny: boolean) =>
    cachedImage(spriteUrl(pokemonId, shiny), SPRITE_WIDTH);
  const typeIconUrlFor = (icon: string) => cachedImage(icon, TYPE_ICON_WIDTH);

  const urls = useMemo(() => {
    const set = new Set<string>();
    team.team_pokemon.forEach((p) => {
      set.add(spriteUrlFor(p.pokemon_id, p.shiny));
      [p.move_1, p.move_2, p.move_3, p.move_4].forEach((mv) => {
        if (!mv) return;
        const type = moveType[mv];
        const icon = type ? typeIcon[type] : null;
        if (icon) set.add(typeIconUrlFor(icon));
      });
    });
    return [...set];
  }, [team.team_pokemon, moveType, typeIcon]);

  const [dataUrls, setDataUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      urls.map(async (url) => [url, await toDataUrl(url)] as const)
    ).then((entries) => {
      if (cancelled) return;
      const map: Record<string, string> = {};
      entries.forEach(([url, dataUrl]) => {
        if (dataUrl) map[url] = dataUrl;
      });
      setDataUrls(map);
    });
    return () => {
      cancelled = true;
    };
  }, [urls]);

  const resolve = (url: string) => dataUrls[url] ?? url;

  return { moveType, typeIcon, spriteUrlFor, typeIconUrlFor, resolve };
};

export type TeamImageData = ReturnType<typeof useTeamImageData>;
