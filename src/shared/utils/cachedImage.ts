import type { CachedImageOptions } from 'types';

/**
 * Builds a wsrv.nl URL that proxies and transforms a remote image
 * (resize, format conversion, quality and optional blur).
 * @param url - The source image URL to proxy.
 * @param width - Target width in pixels.
 * @param opts - Optional output settings (format, quality, blur).
 * @returns The wsrv.nl URL for the transformed image.
 */
export const cachedImage = (
  url: string,
  width: number,
  opts: CachedImageOptions = {}
): string => {
  const params = new URLSearchParams({
    url,
    w: String(width),
    output: opts.format ?? 'webp',
    q: String(opts.quality ?? 75),
    ...(opts.blur ? { blur: String(opts.blur) } : {})
  });
  return `https://wsrv.nl/?${params}`;
};

/**
 * Builds the official-artwork sprite URL for a Pokémon.
 * PokeAPI sprite URLs are predictable (the file name is the ID),
 * so the image can be built without fetching the Pokémon detail.
 * @param id - The Pokémon ID.
 * @param shiny - When true, returns the shiny variant.
 * @returns The official-artwork PNG URL.
 */
export const artworkUrl = (id: string | number, shiny = false): string =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${shiny ? 'shiny/' : ''}${id}.png`;

export const spriteUrl = (id: string | number, shiny = false): string =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${shiny ? 'shiny/' : ''}${id}.png`;

/**
 * Preloads an image and resolves once it has loaded (or failed). Never rejects:
 * a failing icon/image must not block the loading of a whole generation.
 * @param url - The image URL to preload. No-op if empty.
 * @returns A promise that always resolves.
 */
export const preloadImage = (url?: string | null): Promise<void> =>
  new Promise<void>((resolve) => {
    if (!url) return resolve();
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
