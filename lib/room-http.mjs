// Only this account's Pages origin may use the hosted API from another origin.
export const PAGES_ORIGIN = 'https://srnahmet.github.io';
export function roomHeaders(request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin && origin !== PAGES_ORIGIN) return null;
  return {
    'Cache-Control': 'no-store, private',
    'Content-Type': 'application/json',
    'Vary': 'Origin',
    ...(origin ? {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '600',
    } : {}),
  };
}
