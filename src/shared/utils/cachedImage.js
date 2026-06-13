export const cachedImage = (url, width, opts = {}) => {
  const params = new URLSearchParams({
    url,
    w: String(width),
    output: opts.format ?? 'webp',
    q: String(opts.quality ?? 75),
    ...(opts.blur ? { blur: String(opts.blur) } : {})
  })
  return `https://wsrv.nl/?${params}`
}

// Las URLs de sprites de PokeAPI son predecibles (el fichero es el ID),
// así que la imagen se puede construir sin pedir el detalle del pokémon.
export const artworkUrl = (id) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`

// Precarga una imagen y resuelve cuando ha cargado (o fallado). Nunca rechaza:
// un icono/imagen que falle no debe bloquear la carga de toda una generación.
export const preloadImage = (url) =>
  new Promise((resolve) => {
    if (!url) return resolve();
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });