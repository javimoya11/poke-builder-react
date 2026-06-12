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