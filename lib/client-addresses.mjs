export function invitationUrl(origin, basePath, code) {
  const url = new URL(basePath, origin);
  url.searchParams.set('masa', code);
  return url.href;
}
export function invitationEntry(search, sessions = {}) {
  const query = new URLSearchParams(search);
  if (query.has('demo') || !query.has('masa')) return {kind:'none',code:''};
  const code = (query.get('masa') || '').trim().toUpperCase();
  if (!/^[A-Z2-9]{6}$/.test(code)) return {kind:'invalid',code};
  return {kind:typeof sessions?.[code]==='string' && sessions[code].length ? 'resume':'name',code};
}
