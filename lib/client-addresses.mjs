export function invitationUrl(origin, basePath, code) {
  const url = new URL(basePath, origin);
  url.searchParams.set('masa', code);
  return url.href;
}
