import { IncomingMessage, Server } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import * as Y from 'yjs';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import { consumeTicket } from './tickets';
import { postgresPersistence, cleanupOldSessions } from './persistence';
import prisma from '../prisma';

// ---- Message type constants (Yjs WebSocket protocol) -------------------------
const MSG_SYNC = 0;
const MSG_AWARENESS = 1;

// ---- Shared doc registry -----------------------------------------------------

interface SharedDoc {
  ydoc: Y.Doc;
  awareness: awarenessProtocol.Awareness;
  /** Maps each WebSocket to the set of awareness clientIDs it owns. */
  conns: Map<WebSocket, Set<number>>;
}

const docs = new Map<string, SharedDoc>();
const closeTimers = new Map<string, ReturnType<typeof setTimeout>>();

function getOrCreateDoc(docName: string): SharedDoc {
  // Cancel any pending close — client reconnected before grace period expired
  const pending = closeTimers.get(docName);
  if (pending) {
    clearTimeout(pending);
    closeTimers.delete(docName);
  }

  if (docs.has(docName)) return docs.get(docName)!;

  const ydoc = new Y.Doc();
  const awareness = new awarenessProtocol.Awareness(ydoc);

  const doc: SharedDoc = { ydoc, awareness, conns: new Map() };
  docs.set(docName, doc);

  // Load persisted state
  postgresPersistence.bindState(docName, ydoc).catch(console.error);

  // Broadcast Yjs updates to all connected clients
  ydoc.on('update', (update: Uint8Array, origin: WebSocket | null) => {
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MSG_SYNC);
    syncProtocol.writeUpdate(encoder, update);
    const msg = encoding.toUint8Array(encoder);
    doc.conns.forEach((_, conn) => {
      if (conn !== origin && conn.readyState === WebSocket.OPEN) {
        conn.send(msg);
      }
    });
  });

  // Broadcast awareness updates
  awareness.on('update', ({ added, updated, removed }: { added: number[]; updated: number[]; removed: number[] }) => {
    const changedClients = added.concat(updated, removed);
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, MSG_AWARENESS);
    encoding.writeVarUint8Array(encoder, awarenessProtocol.encodeAwarenessUpdate(awareness, changedClients));
    const msg = encoding.toUint8Array(encoder);
    doc.conns.forEach((_, conn) => {
      if (conn.readyState === WebSocket.OPEN) conn.send(msg);
    });
  });

  return doc;
}

function closeDoc(docName: string, doc: SharedDoc) {
  docs.delete(docName);
  postgresPersistence.writeState(docName, doc.ydoc)
    .then(() => doc.ydoc.destroy())
    .catch(console.error);
}

const CLOSE_GRACE_MS = 10_000; // tolerate quick reconnects (e.g. HMR)

function scheduleCloseDoc(docName: string, doc: SharedDoc) {
  if (closeTimers.has(docName)) return;
  const timer = setTimeout(() => {
    closeTimers.delete(docName);
    if (doc.conns.size === 0) closeDoc(docName, doc);
  }, CLOSE_GRACE_MS);
  closeTimers.set(docName, timer);
}

// ---- Per-connection handler --------------------------------------------------

function handleConnection(ws: WebSocket, docName: string) {
  const doc = getOrCreateDoc(docName);
  const ownedClientIds = new Set<number>();
  doc.conns.set(ws, ownedClientIds);

  // Track which awareness clientIDs this connection introduces
  const trackAwareness = ({ added, updated }: { added: number[]; updated: number[] }, origin: unknown) => {
    if (origin === ws) {
      added.forEach((id) => ownedClientIds.add(id));
      updated.forEach((id) => ownedClientIds.add(id));
    }
  };
  doc.awareness.on('update', trackAwareness);

  ws.on('message', (data: Buffer) => {
    try {
      const decoder = decoding.createDecoder(new Uint8Array(data));
      const msgType = decoding.readVarUint(decoder);

      if (msgType === MSG_SYNC) {
        const encoder = encoding.createEncoder();
        encoding.writeVarUint(encoder, MSG_SYNC);
        syncProtocol.readSyncMessage(decoder, encoder, doc.ydoc, ws);
        // encoder.length > 1 means the encoder holds more than just the message type prefix
        if (encoding.length(encoder) > 1) {
          ws.send(encoding.toUint8Array(encoder));
        }
      } else if (msgType === MSG_AWARENESS) {
        awarenessProtocol.applyAwarenessUpdate(doc.awareness, decoding.readVarUint8Array(decoder), ws);
      }
    } catch (e) {
      console.error('[collab] message error:', e);
    }
  });

  ws.on('close', () => {
    doc.awareness.off('update', trackAwareness);
    doc.conns.delete(ws);
    // Remove this connection's awareness states so other clients see them leave
    if (ownedClientIds.size > 0) {
      awarenessProtocol.removeAwarenessStates(doc.awareness, Array.from(ownedClientIds), null);
    }
    if (doc.conns.size === 0) {
      scheduleCloseDoc(docName, doc);
    }
  });

  // Send initial sync step 1 so the client can reply with its missing updates
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, MSG_SYNC);
  syncProtocol.writeSyncStep1(encoder, doc.ydoc);
  ws.send(encoding.toUint8Array(encoder));

  // Send current awareness states to the new client
  const awarenessStates = doc.awareness.getStates();
  if (awarenessStates.size > 0) {
    const enc = encoding.createEncoder();
    encoding.writeVarUint(enc, MSG_AWARENESS);
    encoding.writeVarUint8Array(enc, awarenessProtocol.encodeAwarenessUpdate(doc.awareness, Array.from(awarenessStates.keys())));
    ws.send(encoding.toUint8Array(enc));
  }
}


// ---- Access control ----------------------------------------------------------

async function checkGridAccess(userId: number, gridId: string): Promise<boolean> {
  const results = await prisma.$queryRaw<{ content: string }[]>`
    SELECT c.content FROM crosswords c
    WHERE c.content::jsonb->>'id' = ${gridId}
      AND (
        c.user_id = ${userId}
        OR EXISTS (
          SELECT 1 FROM crosswordshares cs
          JOIN groupmembers gm ON gm.group_id = cs.group_id
          WHERE cs.crossword_id = c.id AND gm.user_id = ${userId}
        )
        OR EXISTS (
          SELECT 1 FROM books b
          JOIN bookshares bs ON bs.book_id = b.id
          JOIN groupmembers gm ON gm.group_id = bs.group_id
          WHERE gm.user_id = ${userId}
            AND b.grid_ids::jsonb->'grids' @> to_jsonb(${gridId}::text)
        )
      )
    LIMIT 1
  `;
  return results.length > 0;
}

// ---- Server setup ------------------------------------------------------------

export function setupCollab(server: Server) {
  const wss = new WebSocketServer({ noServer: true });

  wss.on('connection', (ws: WebSocket, _req: IncomingMessage, docName: string) => {
    handleConnection(ws, docName);
  });

  server.on('upgrade', async (req, socket, head) => {
    let url: URL;
    try {
      url = new URL(req.url!, 'http://localhost');
    } catch {
      socket.destroy();
      return;
    }

    if (!url.pathname.startsWith('/collab/')) return; // leave for other handlers (e.g. HMR)

    const ticket = url.searchParams.get('ticket');
    if (!ticket) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    const userId = consumeTicket(ticket);
    if (!userId) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
      socket.destroy();
      return;
    }

    const encodedRoom = url.pathname.slice('/collab/'.length);
    const roomName = decodeURIComponent(encodedRoom); // "grid:abc123"

    if (roomName.startsWith('grid:')) {
      const gridId = roomName.slice('grid:'.length);
      const hasAccess = await checkGridAccess(userId, gridId);
      if (!hasAccess) {
        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
        socket.destroy();
        return;
      }
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req, roomName);
    });
  });

  // Cleanup stale sessions every hour
  setInterval(cleanupOldSessions, 60 * 60 * 1000);
}
