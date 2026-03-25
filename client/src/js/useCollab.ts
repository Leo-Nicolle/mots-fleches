import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { ref, Ref, onBeforeUnmount } from 'vue';
import { Grid, Cell } from 'grid';

const API_BASE = import.meta.env.DEV ? 'http://localhost:5480/api' : '/api';
const WS_BASE = import.meta.env.DEV
  ? 'ws://localhost:5480/collab'
  : `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/collab`;

export type CollabStatus = 'disconnected' | 'connecting' | 'connected';

export interface RemoteUser {
  clientId: number;
  name: string;
  color: string;
  focus: { x: number; y: number } | null;
}

/** Cell fields we sync over Yjs (excludes ephemeral UI state). */
interface SyncedCell {
  text: string;
  definition: boolean;
  arrows: string[];
  spaceV: boolean;
  spaceH: boolean;
}

export function useCollab(gridId: string, grid: Ref<Grid | undefined>, onRemoteChange?: () => void) {
  const status = ref<CollabStatus>('disconnected');
  const remoteUsers = ref<RemoteUser[]>([]);

  let ydoc: Y.Doc | null = null;
  let provider: WebsocketProvider | null = null;
  let remoteUpdate = false;

  // ---- Connect ----------------------------------------------------------------

  async function connect() {
    if (provider) return; // already connected

    // 1. Exchange JWT for a one-time ticket (response includes display name)
    const accessToken = localStorage.getItem('accessToken') || '';
    const ticketRes = await fetch(`${API_BASE}/collab/ticket`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!ticketRes.ok) throw new Error('Failed to obtain collab ticket');
    const { ticket, name: userName } = await ticketRes.json();

    // 2. Create Yjs document
    ydoc = new Y.Doc();
    const yCells = ydoc.getMap<string>('cells');

    // 3. Open WebSocket
    status.value = 'connecting';
    provider = new WebsocketProvider(WS_BASE, `grid:${gridId}`, ydoc, {
      params: { ticket },
    });

    provider.on('status', (event: { status: string }) => {
      status.value = event.status as CollabStatus;
    });

    // 4. On first sync: if doc is empty, push local state; otherwise apply remote
    provider.once('sync', (isSynced: boolean) => {
      if (!isSynced || !grid.value) return;
      if (yCells.size === 0) {
        pushGridToYjs(grid.value);
      } else {
        applyYjsToGrid();
        onRemoteChange?.();
      }
    });

    // 5. Observe remote cell changes
    yCells.observe((event) => {
      if (remoteUpdate || !grid.value) return;
      let changed = false;
      event.changes.keys.forEach((change, key) => {
        if (change.action === 'delete') return;
        const raw = yCells.get(key);
        if (!raw) return;
        const data: SyncedCell = JSON.parse(raw);
        const [x, y] = key.split(',').map(Number);
        const cell = grid.value!.cells[y]?.[x];
        if (!cell) return;
        cell.text = data.text;
        cell.definition = data.definition;
        cell.arrows = data.arrows as Cell['arrows'];
        cell.spaceV = data.spaceV;
        cell.spaceH = data.spaceH;
        changed = true;
      });
      if (changed) onRemoteChange?.();
    });

    // 6. Awareness: track remote users' focus
    provider.awareness.setLocalStateField('user', {
      name: userName,
      color: randomColor(),
    });

    provider.awareness.on('change', () => {
      const states = provider!.awareness.getStates() as Map<number, Record<string, unknown>>;
      const localId = ydoc!.clientID;
      const users: RemoteUser[] = [];
      states.forEach((state, clientId) => {
        if (clientId === localId) return;
        const user = state.user as { name: string; color: string } | undefined;
        const focus = state.focus as { x: number; y: number } | null | undefined;
        if (user) {
          users.push({ clientId, name: user.name, color: user.color, focus: focus ?? null });
        }
      });
      remoteUsers.value = users;
    });
  }

  // ---- Push local → Yjs -------------------------------------------------------

  function pushGridToYjs(g: Grid) {
    if (!ydoc) return;
    const yCells = ydoc.getMap<string>('cells');
    const yMeta = ydoc.getMap<unknown>('meta');

    ydoc.transact(() => {
      // Meta
      const state = g.serialize();
      yMeta.set('id', state.id);
      yMeta.set('rows', state.rows);
      yMeta.set('cols', state.cols);
      yMeta.set('title', state.title);
      yMeta.set('created', state.created);
      yMeta.set('comment', state.comment);
      yMeta.set('styleId', state.styleId);

      // Cells
      for (let y = 0; y < state.rows; y++) {
        for (let x = 0; x < state.cols; x++) {
          const cell = state.cells[y][x];
          yCells.set(`${x},${y}`, JSON.stringify({
            text: cell.text,
            definition: cell.definition,
            arrows: cell.arrows,
            spaceV: cell.spaceV,
            spaceH: cell.spaceH,
          } satisfies SyncedCell));
        }
      }
    });
  }

  /** Sync all grid cells into Yjs after a local edit. */
  function syncUpdate() {
    if (!ydoc || !grid.value || remoteUpdate) return;
    const yCells = ydoc.getMap<string>('cells');
    const cells = grid.value.cells;

    ydoc.transact(() => {
      for (let y = 0; y < cells.length; y++) {
        for (let x = 0; x < cells[y].length; x++) {
          const cell = cells[y][x];
          yCells.set(`${x},${y}`, JSON.stringify({
            text: cell.text,
            definition: cell.definition,
            arrows: cell.arrows,
            spaceV: cell.spaceV,
            spaceH: cell.spaceH,
          } satisfies SyncedCell));
        }
      }
    });
  }

  // ---- Apply remote → grid ----------------------------------------------------

  function applyYjsToGrid() {
    if (!ydoc || !grid.value) return;
    const yCells = ydoc.getMap<string>('cells');
    remoteUpdate = true;
    yCells.forEach((raw, key) => {
      const data: SyncedCell = JSON.parse(raw);
      const [x, y] = key.split(',').map(Number);
      const cell = grid.value!.cells[y]?.[x];
      if (!cell) return;
      cell.text = data.text;
      cell.definition = data.definition;
      cell.arrows = data.arrows as Cell['arrows'];
      cell.spaceV = data.spaceV;
      cell.spaceH = data.spaceH;
    });
    remoteUpdate = false;
  }

  // ---- Awareness: broadcast focus cell ----------------------------------------

  function setFocus(x: number, y: number) {
    provider?.awareness.setLocalStateField('focus', { x, y });
  }

  // ---- Disconnect -------------------------------------------------------------

  function disconnect() {
    provider?.disconnect();
    ydoc?.destroy();
    provider = null;
    ydoc = null;
    status.value = 'disconnected';
    remoteUsers.value = [];
  }

  onBeforeUnmount(disconnect);

  return { status, remoteUsers, connect, disconnect, syncUpdate, setFocus };
}

function randomColor() {
  const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'];
  return colors[Math.floor(Math.random() * colors.length)];
}
