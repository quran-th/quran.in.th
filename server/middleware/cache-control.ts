export default defineEventHandler((event) => {
  const url = event.node.req.url;

  if (!url) return;

  // Prevent HTML caching - ensures fresh asset URLs after deployment
  if (url === '/' || url.endsWith('.html')) {
    setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate');
    setHeader(event, 'Pragma', 'no-cache');
    setHeader(event, 'Expires', '0');
    return;
  }

  // Prevent service worker caching - enables automatic updates
  if (url === '/sw.js' || url.endsWith('/sw.js')) {
    setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate');
    setHeader(event, 'Pragma', 'no-cache');
    setHeader(event, 'Expires', '0');
    return;
  }

  // Prevent manifest caching - enables PWA updates
  if (url === '/manifest.json' || url.endsWith('/manifest.json')) {
    setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate');
    setHeader(event, 'Pragma', 'no-cache');
    setHeader(event, 'Expires', '0');
    return;
  }

  // Allow aggressive caching for hashed assets (already handled by route rules)
  if (url.includes('/_nuxt/')) {
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable');
    return;
  }

  // Cache static assets appropriately
  if (url.includes('/fonts/')) {
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable');
    return;
  }

  if (url.includes('/audio/')) {
    setHeader(event, 'Cache-Control', 'public, max-age=86400'); // 1 day for audio
    return;
  }
});