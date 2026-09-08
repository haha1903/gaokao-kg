const TOKEN = /^kg1_[A-Za-z0-9_-]{43}$/;
const ID = /^[A-Za-z0-9_-]{1,80}$/;
const MAX_RECORDS = 1000;
// Allow JSON escaping and multibyte text within the documented character limits.
const MAX_BODY = 80 * 1024;

class HttpError extends Error {
  constructor(status, code) { super(code); this.status = status; }
}

function json(value, status = 200) {
  return Response.json(value, { status, headers: {
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
  } });
}

async function hash(value) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
}

async function readBody(request) {
  if (!request.headers.get('Content-Type')?.startsWith('application/json')) throw new HttpError(415, 'json_required');
  if (!request.body) throw new HttpError(400, 'invalid_annotation');
  // Bound the stream as well as Content-Length, which callers can omit.
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY) { await reader.cancel(); throw new HttpError(413, 'body_too_large'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new HttpError(400, 'invalid_json'); }
}

export function validateAnnotation(value, id) {
  if (!value || typeof value !== 'object' || !ID.test(id) || String(value.id) !== id ||
      typeof value.nodeId !== 'string' || !ID.test(value.nodeId) ||
      !['hl', 'q', 'note'].includes(value.kind) ||
      typeof value.quote !== 'string' || !value.quote.trim() || value.quote.length > 4000 ||
      typeof value.note !== 'string' || value.note.length > 8000 ||
      typeof value.ts !== 'string' || value.ts.length > 32 || !Number.isFinite(Date.parse(value.ts))) {
    throw new HttpError(400, 'invalid_annotation');
  }
  return { id, nodeId: value.nodeId, quote: value.quote, kind: value.kind, note: value.note, ts: new Date(value.ts).toISOString() };
}

async function route(request, env) {
  const url = new URL(request.url);
  const origin = request.headers.get('Origin');
  if ((origin && origin !== url.origin) || request.headers.get('Sec-Fetch-Site') === 'cross-site') throw new HttpError(403, 'cross_origin');
  const path = url.pathname.replace(/\/$/, '');
  if (path === '/api/health' && request.method === 'GET') {
    await env.DB.prepare('SELECT token_hash FROM notebooks LIMIT 0').all();
    return json({ ok: true, storage: 'D1' });
  }
  const match = path.match(/^\/api\/annotations\/([A-Za-z0-9_-]{1,80})$/);
  if (path !== '/api/notebook' && !match) throw new HttpError(404, 'not_found');
  if (!(path === '/api/notebook' ? ['POST', 'GET'] : ['PUT', 'DELETE']).includes(request.method)) throw new HttpError(405, 'method_not_allowed');
  const token = request.headers.get('Authorization')?.replace(/^Bearer /, '') || '';
  if (!TOKEN.test(token)) throw new HttpError(401, 'invalid_code');
  const notebookHash = await hash(token);
  const book = await env.DB.prepare('SELECT token_hash FROM notebooks WHERE token_hash = ?').bind(notebookHash).first();

  if (path === '/api/notebook' && request.method === 'POST') {
    if (!book) {
      const now = Math.floor(Date.now() / 1000);
      // Cap anonymous notebook creation per source and hour, without retaining raw IPs.
      const source = await hash(`${Math.floor(now / 86400)}:${request.headers.get('CF-Connecting-IP') || 'local'}`);
      const result = await env.DB.prepare(`INSERT OR IGNORE INTO notebooks (token_hash, creation_source, created_at)
        SELECT ?, ?, ? WHERE (SELECT COUNT(*) FROM notebooks WHERE creation_source = ? AND created_at > ?) < 20`)
        .bind(notebookHash, source, now, source, now - 3600).run();
      if (!result.meta.changes && !await env.DB.prepare('SELECT token_hash FROM notebooks WHERE token_hash = ?').bind(notebookHash).first()) throw new HttpError(429, 'creation_limit');
    }
    return json({ ok: true });
  }
  if (!book) throw new HttpError(401, 'unknown_notebook');

  if (request.method === 'GET') {
    const { results } = await env.DB.prepare(`SELECT id, node_id AS nodeId, quote, kind, note, ts
      FROM annotations WHERE notebook_hash = ? AND deleted = 0 ORDER BY ts, id`).bind(notebookHash).all();
    return json({ annotations: results });
  }

  const id = match[1];
  if (request.method === 'PUT') {
    const a = validateAnnotation(await readBody(request), id);
    // Immutable inserts and retained tombstones make retries safe across devices.
    await env.DB.prepare(`INSERT OR IGNORE INTO annotations (notebook_hash, id, node_id, quote, kind, note, ts)
      SELECT ?, ?, ?, ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM annotations WHERE notebook_hash = ?) < ?`)
      .bind(notebookHash, id, a.nodeId, a.quote, a.kind, a.note, a.ts, notebookHash, MAX_RECORDS).run();
  } else {
    await env.DB.prepare(`INSERT INTO annotations (notebook_hash, id, deleted)
      SELECT ?, ?, 1 WHERE (SELECT COUNT(*) FROM annotations WHERE notebook_hash = ?) < ?
        OR EXISTS (SELECT 1 FROM annotations WHERE notebook_hash = ? AND id = ?)
      ON CONFLICT(notebook_hash, id) DO UPDATE SET deleted = 1, quote = '', note = ''`)
      .bind(notebookHash, id, notebookHash, MAX_RECORDS, notebookHash, id).run();
  }
  const saved = await env.DB.prepare('SELECT id FROM annotations WHERE notebook_hash = ? AND id = ?').bind(notebookHash, id).first();
  if (!saved) throw new HttpError(409, 'notebook_full');
  return json({ ok: true });
}

export async function handleRequest(request, env) {
  try { return await route(request, env); }
  catch (error) {
    // Never echo bearer credentials, note content, or database errors to clients.
    return json({ error: error instanceof HttpError ? error.message : 'storage_unavailable' }, error instanceof HttpError ? error.status : 503);
  }
}
