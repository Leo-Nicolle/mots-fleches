import * as Y from 'yjs';
import prisma from '../prisma';

// ---- Helpers ----------------------------------------------------------------

async function saveYdocState(docName: string, ydoc: Y.Doc) {
  const update = Buffer.from(Y.encodeStateAsUpdate(ydoc));
  await prisma.$executeRaw`
    INSERT INTO ydocupdates (doc_name, update, updated_at)
    VALUES (${docName}, ${update}, NOW())
    ON CONFLICT (doc_name) DO UPDATE
      SET update = EXCLUDED.update,
          updated_at = NOW()
  `;
}

async function writeGridToCrosswords(docName: string, ydoc: Y.Doc) {
  const gridId = docName.replace(/^grid:/, '');
  const meta = ydoc.getMap('meta').toJSON() as Record<string, unknown>;
  const cellsRaw = ydoc.getMap('cells').toJSON() as Record<string, string>;

  if (!meta.rows || !meta.cols) return; // doc not yet initialized

  const rows = meta.rows as number;
  const cols = meta.cols as number;
  const cells: unknown[][] = [];

  for (let y = 0; y < rows; y++) {
    cells[y] = [];
    for (let x = 0; x < cols; x++) {
      const key = `${x},${y}`;
      const raw = cellsRaw[key];
      cells[y][x] = raw
        ? JSON.parse(raw)
        : { x, y, definition: false, highlighted: false, suggestion: '', arrows: ['none', 'none', 'none'], text: '', spaceV: false, spaceH: false };
    }
  }

  const gridState = { ...meta, cells };
  const content = JSON.stringify(gridState);

  await prisma.$executeRaw`
    UPDATE crosswords
    SET content = ${content}, updated_at = NOW()
    WHERE content::jsonb->>'id' = ${gridId}
  `;
}

// ---- Persistence object for setPersistence() --------------------------------

export const postgresPersistence = {
  bindState: async (docName: string, ydoc: Y.Doc) => {
    const row = await prisma.ydocupdates.findUnique({ where: { doc_name: docName } });
    if (row) {
      Y.applyUpdate(ydoc, row.update as unknown as Uint8Array);
    }

    // Persist every 30 s during an active session (crash recovery)
    const interval = setInterval(() => saveYdocState(docName, ydoc), 30_000);
    ydoc.on('destroy', () => clearInterval(interval));
  },

  writeState: async (docName: string, ydoc: Y.Doc) => {
    await saveYdocState(docName, ydoc);
    await writeGridToCrosswords(docName, ydoc);
  },
};

// ---- Cleanup cron -----------------------------------------------------------

/** Delete ydoc rows that haven't been updated in 24 h. */
export async function cleanupOldSessions() {
  await prisma.$executeRaw`
    DELETE FROM ydocupdates
    WHERE updated_at < NOW() - INTERVAL '24 hours'
  `;
}
