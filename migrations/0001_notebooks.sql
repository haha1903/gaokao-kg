-- Recovery codes are bearer credentials; only their SHA-256 hashes are stored.
CREATE TABLE notebooks (
  token_hash TEXT PRIMARY KEY,
  creation_source TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX notebooks_creation ON notebooks(creation_source, created_at);

CREATE TABLE annotations (
  notebook_hash TEXT NOT NULL REFERENCES notebooks(token_hash) ON DELETE CASCADE,
  id TEXT NOT NULL,
  node_id TEXT NOT NULL DEFAULT '',
  quote TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL DEFAULT 'hl' CHECK(kind IN ('hl', 'q', 'note')),
  note TEXT NOT NULL DEFAULT '',
  ts TEXT NOT NULL DEFAULT '',
  deleted INTEGER NOT NULL DEFAULT 0 CHECK(deleted IN (0, 1)),
  PRIMARY KEY (notebook_hash, id)
);
