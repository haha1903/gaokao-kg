const KEY = 'em-kg-cloud-v1';
const LEGACY_KEY = 'em-kg-annotations';
export const validCode = code => /^kg1_[A-Za-z0-9_-]{43}$/.test(code);

function newCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return 'kg1_' + btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function overlay(remote, queue) {
  const items = new Map(remote.map(a => [String(a.id), a]));
  for (const op of queue) {
    if (op.type === 'delete') items.delete(op.id);
    else items.set(op.id, op.annotation);
  }
  return [...items.values()].sort((a, b) => a.ts.localeCompare(b.ts) || a.id.localeCompare(b.id));
}

export class AnnotationStore {
  constructor({ storage = localStorage, fetcher = (url, options) => fetch(url, options), onChange = () => {} } = {}) {
    this.storage = storage;
    this.fetcher = fetcher;
    this.onChange = onChange;
    this.status = 'local';
    this.error = '';
    this.running = null;
    if (!storage.getItem(KEY)) {
      const legacy = JSON.parse(storage.getItem(LEGACY_KEY) || '[]');
      if (!Array.isArray(legacy)) throw new Error('invalid_local_data');
      const items = legacy.map(a => ({ ...a, id: String(a.id) }));
      // Keep the legacy key as a backup; the outbox makes migration idempotent.
      this.write({ token: null, connected: false, items, queue: items.map(annotation => this.operation('put', annotation.id, annotation)) });
    }
    this.read();
  }

  read() {
    const state = JSON.parse(this.storage.getItem(KEY));
    if (!state || !Array.isArray(state.items) || !Array.isArray(state.queue) || (state.token && !validCode(state.token))) throw new Error('invalid_local_data');
    return state;
  }

  write(state) {
    const value = JSON.stringify(state);
    // Avoid storage-event feedback loops between tabs after an unchanged refresh.
    if (this.storage.getItem(KEY) !== value) this.storage.setItem(KEY, value);
  }
  operation(type, id, annotation) { return { opId: crypto.randomUUID(), type, id, ...(annotation ? { annotation } : {}) }; }
  emit() { this.onChange(this.read(), this.status, this.error); }

  add(annotation) {
    const state = this.read();
    const item = { ...annotation, id: crypto.randomUUID(), ts: new Date().toISOString() };
    state.token ||= newCode();
    state.items.push(item);
    state.queue.push(this.operation('put', item.id, item));
    this.write(state);
    this.emit();
    void this.sync();
  }

  remove(id) {
    id = String(id);
    const state = this.read();
    state.items = state.items.filter(a => a.id !== id);
    state.queue = state.queue.filter(op => op.id !== id);
    state.queue.push(this.operation('delete', id));
    this.write(state);
    this.emit();
    void this.sync();
  }

  enable() {
    const state = this.read();
    state.token ||= newCode();
    this.write(state);
    return this.sync();
  }

  async request(token, path, method = 'GET', body) {
    const response = await this.fetcher('/api/' + path, {
      method, cache: 'no-store', credentials: 'omit',
      headers: { Authorization: 'Bearer ' + token, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(15000),
    });
    let data;
    try { data = await response.json(); }
    catch { throw new Error('storage_unavailable'); }
    if (!response.ok) throw new Error(data.error || 'storage_unavailable');
    return data;
  }

  async restore(code) {
    code = code.trim();
    if (!validCode(code)) throw new Error('invalid_code');
    const before = this.read();
    if (before.token && before.token !== code && before.queue.length) throw new Error('pending_changes');
    const data = await this.request(code, 'notebook');
    const current = this.read();
    if (current.token !== before.token || JSON.stringify(current.queue) !== JSON.stringify(before.queue)) throw new Error('state_changed');
    if (current.token === code) { await this.sync(); return; }
    // Preserve the previous notebook locally before a deliberate switch.
    if (current.token) this.storage.setItem('em-kg-cloud-backup', JSON.stringify(current));
    const queue = current.token ? [] : current.queue;
    this.write({ token: code, connected: true, items: overlay(data.annotations, queue), queue });
    this.status = 'synced';
    this.error = '';
    this.emit();
    await this.sync();
  }

  sync() {
    if (this.running) return this.running;
    this.running = this.flush().finally(() => {
      this.running = null;
      if (this.status === 'pending' && !this.error && this.read().token) void this.sync();
    });
    return this.running;
  }

  async flush() {
    const token = this.read().token;
    if (!token) { this.status = 'local'; this.emit(); return; }
    this.status = 'syncing'; this.error = ''; this.emit();
    try {
      if (!this.read().connected) {
        await this.request(token, 'notebook', 'POST');
        const state = this.read();
        if (state.token !== token) return;
        state.connected = true; this.write(state);
      }
      // Persist each acknowledged operation separately so a failed request can retry.
      while (this.read().token === token) {
        const op = this.read().queue[0];
        if (!op) break;
        await this.request(token, 'annotations/' + encodeURIComponent(op.id), op.type === 'put' ? 'PUT' : 'DELETE', op.annotation);
        const state = this.read();
        if (state.token !== token) return;
        state.queue = state.queue.filter(item => item.opId !== op.opId);
        this.write(state);
      }
      const data = await this.request(token, 'notebook');
      const state = this.read();
      if (state.token !== token) return;
      state.items = overlay(data.annotations, state.queue);
      this.write(state);
      this.status = state.queue.length ? 'pending' : 'synced';
    } catch (error) {
      if (this.read().token !== token) return;
      this.status = 'pending';
      this.error = error.message;
    }
    this.emit();
  }
}
