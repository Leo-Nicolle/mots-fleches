# Debug: grid resize lost after logout/login

## Symptom

1. Login
2. Resize a grid (e.g. 10 rows -> 12 rows)
3. Edit the grid (fill some squares)
4. Logout, then login again
5. The grid is back to 10 rows

Observed: the local IndexedDB copy is still 10 rows (it was never updated
during the logged-in session).

## How to inspect the server DB (run on the server over ssh)

The DB is Postgres running in a docker container. Find the container name:

```bash
docker ps --format '{{.Names}}' | grep -i crosswords
```

Query the grid row (adjust the container name, likely `crosswords-db`):

```bash
docker exec -i crosswords-db psql -U motsflex_admin_user -d crosswords_db -c \
"SELECT content::jsonb->>'id' AS id, content::jsonb->>'rows' AS rows, content::jsonb->>'cols' AS cols, updated_at FROM crosswords WHERE content::jsonb->>'id' = 'b119ba24-78f6-48cc-a9ac-ba7e80374a9c';"
```

Check the collab (Yjs) persistence for the same grid:

```bash
docker exec -i crosswords-db psql -U motsflex_admin_user -d crosswords_db -c \
"SELECT doc_name, updated_at FROM ydocupdates WHERE doc_name = 'grid:b119ba24-78f6-48cc-a9ac-ba7e80374a9c';"
```

Key values to check:

- `crosswords.content.rows` -> what the server actually has (expect 10 if bug reproduces)
- `crosswords.updated_at` -> whether a write happened around logout
- `ydocupdates` row present -> confirms a collab session persisted

## Root cause theory

There are two competing persistence paths when logged in:

1. **REST autosave** (`api.saveGrid` -> `RemoteDB.pushGrid` -> `POST /grid`).
   Saves the full grid state (correct `rows`/`cols`).

2. **Collab (Yjs)** via `useCollab`. On disconnect/close, the server calls
   `writeGridToCrosswords` which reconstructs the grid from the Yjs `meta`
   map and overwrites `crosswords.content`.

The bug is in the collab path:

- `pushGridToYjs` (client/src/js/useCollab.ts) writes `meta.rows`/`meta.cols`
  only once, on first sync when the Yjs doc is empty.
- `syncUpdate` (client/src/js/useCollab.ts) only pushes **cells**, never the
  `meta` map. Resizing a grid does not trigger a collab sync at all, and cell
  edits do not update `rows`/`cols`.
- On logout, `GridEditor` unmounts -> collab `disconnect()`. The server keeps
  the doc alive ~10s, then `closeDoc` -> `writeState` ->
  `writeGridToCrosswords` (server/api/src/collab/persistence.ts) rebuilds
  `crosswords.content` using the **stale** `meta.rows`/`meta.cols` (still 10),
  overwriting the correct 12-row REST save.

Then on next login, `syncOnLogin` (client/src/api/index.ts) treats remote as
authoritative for grids ("remote wins for conflicts"), so it overwrites the
local IndexedDB copy with the (now 10-row) remote version.

The local IndexedDB is also never updated during the logged-in session because
`api.mode === 'remote'` routes all `saveGrid` calls to the server, not idb.

## Proposed fix

1. `useCollab.syncUpdate` should also sync the `meta` map (rows, cols, title,
   comment, styleId, created), not just cells.
2. Trigger a collab sync on resize/metadata changes (e.g. the deep grid watcher
   in `GridEditor.vue` should call `collab.syncUpdate()` when in collab mode).
