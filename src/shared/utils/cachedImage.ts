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

/**
 * Fetches a remote image and returns it as a base64 data URI. Embedding the
 * bytes directly (rather than letting a capture library re-fetch the URL)
 * avoids html-to-image collapsing several images that share a proxy host
 * into a single cached one. Never rejects: a failing image resolves to null
 * so one broken sprite can't abort a whole export.
 * @param url - The image URL to inline. No-op if empty.
 * @returns A promise of the data URI, or null if it couldn't be fetched.
 */
export const toDataUrl = async (
  url?: string | null
): Promise<string | null> => {
  if (!url) return null;
  try {
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};
