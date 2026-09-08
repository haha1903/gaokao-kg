import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { handleRequest } from '../server/api.js';
import { AnnotationStore } from '../assets/annotations.js';

let sqlite;
let env;
const codeA = 'kg1_' + 'A'.repeat(43);
const codeB = 'kg1_' + 'B'.repeat(43);
const annotation = { id: 'note-1', nodeId: 'field-view', quote: 'A field', note: '<script>alert(1)</script>', kind: 'note', ts: '2026-09-08T01:00:00.000Z' };

beforeEach(() => {
  sqlite?.close();
  sqlite = new DatabaseSync(':memory:');
  sqlite.exec('PRAGMA foreign_keys = ON');
  sqlite.exec(readFileSync(new URL('../migrations/0001_notebooks.sql', import.meta.url), 'utf8'));
  // Run the production SQL against SQLite, using the D1 statement interface.
  env = { DB: { prepare(sql) {
    const statement = sqlite.prepare(sql);
    let values = [];
    return {
      bind(...args) { values = args; return this; },
      async first() { return statement.get(...values) || null; },
      async all() { return { results: statement.all(...values) }; },
      async run() { return { meta: statement.run(...values) }; },
    };
  } } };
});

function api(path, { token = codeA, method = 'GET', body, headers = {} } = {}) {
  return handleRequest(new Request('https://example.com/api/' + path, {
    method, headers: { Authorization: 'Bearer ' + token, ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers },
    ...(body ? { body: typeof body === 'string' ? body : JSON.stringify(body) } : {}),
  }), env);
}
const create = token => api('notebook', { token, method: 'POST' });
const put = (a = annotation, token = codeA) => api('annotations/' + a.id, { token, method: 'PUT', body: a });
const notes = async (token = codeA) => (await (await api('notebook', { token })).json()).annotations;

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}
const fetcher = (path, options) => handleRequest(new Request('https://example.com' + path, options), env);

test('server persistence, notebook isolation and hashed credentials', async () => {
  assert.equal((await api('notebook')).status, 401);
  await create(codeA); await create(codeB);
  assert.equal((await put()).status, 200);
  assert.deepEqual(await notes(), [annotation]);
  assert.deepEqual(await notes(codeB), []);
  await api('annotations/note-1', { token: codeB, method: 'DELETE' });
  assert.equal((await notes()).length, 1);
  assert.equal(sqlite.prepare('SELECT COUNT(*) AS n FROM notebooks WHERE token_hash = ?').get(codeA).n, 0);
  assert.equal((await api('notebook', { token: 'wrong' })).status, 401);
});

test('retries cannot overwrite a note or resurrect a deletion, including delete-before-create', async () => {
  await create(codeA);
  await put(); await put({ ...annotation, note: 'stale overwrite' });
  assert.deepEqual(await notes(), [annotation]);
  await api('annotations/note-1', { method: 'DELETE' });
  await put();
  await api('annotations/offline-id', { method: 'DELETE' });
  await put({ ...annotation, id: 'offline-id' });
  assert.deepEqual(await notes(), []);
});

test('validates input, origin, routes and payload size without caching notes', async () => {
  await create(codeA);
  for (const changed of [{ kind: 'bad' }, { quote: '' }, { note: 'x'.repeat(8001) }, { nodeId: '<img>' }, { ts: 'bad' }, { id: 'different' }]) {
    assert.equal((await api('annotations/note-1', { method: 'PUT', body: { ...annotation, ...changed } })).status, 400);
  }
  assert.equal((await api('annotations/note-1', { method: 'PUT', body: '{' })).status, 400);
  assert.equal((await api('annotations/note-1', { method: 'PUT', body: 'x'.repeat(25000) })).status, 413);
  assert.equal((await api('notebook', { headers: { Origin: 'https://evil.example' } })).status, 403);
  assert.equal((await api('notebook', { headers: { 'Sec-Fetch-Site': 'cross-site' } })).status, 403);
  assert.equal((await api('missing')).status, 404);
  assert.equal((await api('notebook', { method: 'DELETE' })).status, 405);
  assert.equal((await api('notebook')).headers.get('Cache-Control'), 'no-store');
});

test('limits anonymous creation and notebook capacity while allowing deletion at capacity', async () => {
  for (let i = 0; i < 20; i++) assert.equal((await create('kg1_' + String(i).padStart(43, '0'))).status, 200);
  assert.equal((await create(codeA)).status, 429);
  const token = 'kg1_' + '0'.repeat(43);
  assert.equal((await create(token)).status, 200);
  const { token_hash: hash } = sqlite.prepare('SELECT token_hash FROM notebooks LIMIT 1').get();
  sqlite.prepare(`WITH RECURSIVE n(i) AS (VALUES(1) UNION ALL SELECT i+1 FROM n WHERE i<1000)
    INSERT INTO annotations(notebook_hash, id) SELECT ?, 'item-' || i FROM n`).run(hash);
  const fullCode = Array.from({ length: 20 }, (_, i) => 'kg1_' + String(i).padStart(43, '0'));
  let matching;
  for (const code of fullCode) if ((await notes(code)).length) matching = code;
  assert.equal((await put(annotation, matching)).status, 409);
  assert.equal((await api('annotations/item-1', { token: matching, method: 'DELETE' })).status, 200);
});

test('migrates legacy notes once and restores them on an independent device', async () => {
  const storage = memoryStorage({ 'em-kg-annotations': JSON.stringify([{ ...annotation, id: 123 }]) });
  const first = new AnnotationStore({ storage, fetcher });
  await first.enable();
  assert.equal(first.status, 'synced');
  assert.equal(first.read().queue.length, 0);
  const second = new AnnotationStore({ storage: memoryStorage(), fetcher });
  await second.restore(first.read().token);
  assert.deepEqual(second.read().items, [{ ...annotation, id: '123' }]);
  const reloaded = new AnnotationStore({ storage, fetcher });
  await reloaded.sync();
  assert.equal((await notes(first.read().token)).length, 1);
  second.remove('123'); await second.sync(); await first.sync();
  assert.deepEqual(first.read().items, []);
});

test('offline operations survive reload and a server-accepted request whose response was lost', async () => {
  const storage = memoryStorage();
  const first = new AnnotationStore({ storage, fetcher: async () => { throw new Error('offline'); } });
  first.add(annotation); await first.sync();
  assert.equal(first.read().queue.length, 1);
  assert.equal(first.status, 'pending');
  let loseResponse = true;
  const second = new AnnotationStore({ storage, fetcher: async (path, options) => {
    const result = await fetcher(path, options);
    if (options.method === 'PUT' && loseResponse) { loseResponse = false; throw new Error('connection_lost'); }
    return result;
  } });
  await second.sync();
  assert.equal(second.read().queue.length, 1);
  await second.sync();
  assert.equal(second.read().queue.length, 0);
  assert.equal((await notes(second.read().token)).length, 1);
});

test('independent tabs retain both additions and protect pending notes when switching notebooks', async () => {
  const storage = memoryStorage();
  const first = new AnnotationStore({ storage, fetcher });
  const second = new AnnotationStore({ storage, fetcher });
  first.add({ ...annotation, quote: 'first tab' });
  second.add({ ...annotation, quote: 'second tab' });
  await Promise.all([first.sync(), second.sync()]);
  await first.sync();
  assert.equal(first.read().items.length, 2);
  first.fetcher = async () => { throw new Error('offline'); };
  first.add(annotation); await first.sync();
  await assert.rejects(first.restore(codeB), /pending_changes/);
  assert.equal(first.read().items.length, 3);
});
