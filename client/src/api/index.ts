import {
  Grid,
  GridState,
  GridStyle,
  SolutionStyle,
  getDefinitions,
} from "grid";
import { Database, Idatabase, SupaDB, RemoteDB, Book, Font } from "database";
import { v4 as uuid } from "uuid";
import throttle from "lodash.throttle";
import { setDatabase } from "database";

class API {
  public idb: Idatabase;
  public supadb: SupaDB;
  public remote: RemoteDB;
  public _mode: string;
  constructor(mode: string = "unknown") {
    this.idb = new Idatabase();
    this.supadb = new SupaDB(
      "https://tnvxmrqhkdlynhtdzmpw.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRudnhtcnFoa2RseW5odGR6bXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODIyNTM0MTEsImV4cCI6MTk5NzgyOTQxMX0.4PczPPAxbkwBvig7NTHNbR8JumuwPPqfyS_kGnkxP5I"
    );
    const token = localStorage.getItem("accessToken") || "";
    this.remote = new RemoteDB(import.meta.env.DEV ? "http://localhost:5480/api" : "/api", token);
    this._mode = mode;
  }

  get db(): Database {
    if (this.mode === "idb") {
      return this.idb;
    } else if (this.mode === "supadb") {
      return this.supadb;
    } else if (this.mode === "remote") {
      return this.remote;
    } else {
      throw new Error("Unknown database mode");
    }
  }

  set mode(mode: string) {
    localStorage.setItem("db-mode", mode);
    this._mode = mode;
  }
  get mode() {
    return this._mode;
  }

  getGrids() {
    return this.db
      .getGrids()
      .then((grids) => grids.map((grid) => Grid.unserialize(grid)));
  }

  getGrid(id: string): Promise<Grid | undefined> {
    return this.db
      .getGrid(id)
      .then((grid) => (grid ? Grid.unserialize(grid) : undefined));
  }

  getStyle(id: string): Promise<GridStyle | SolutionStyle | undefined> {
    return this.db
      .getStyle(id)
      .then((style) => (style ? style : undefined));
  }

  getBookGrids(bookId: string) {
    return this.db
      .getBook(bookId)
      .then((book) =>
        book
          ? Promise.all(book.grids.map((id) => this.db.getGrid(id)))
          : ([] as Grid[])
      );
  }

  duplicateGrids(ids: string[], bookId: string) {
    return Promise.all(ids.map((id) => this.db.getGrid(id)))
      .then((grids) => {
        const newGrids = grids
          .filter((g) => g)
          .map((grid) => {
            grid!.id = uuid();
            return grid;
          }) as GridState[];

        return Promise.all(newGrids.map((g) => this.db.pushGrid(g)));
      })
      .then((grids) => {
        this.db.getBook(bookId).then((book) => {
          if (!book) {
            // TODO: cleanup the grids
            return Promise.reject("Book not found");
          }
          book.grids.push(...grids);
          return this.db.pushBook(book);
        });
      });
  }

  moveGrids(grids: string[], sourceBook: string, targetBook: string) {
    const set = new Set(grids);
    return Promise.all(
      [sourceBook, targetBook].map((id) => this.db.getBook(id))
    ).then(([source, target]) => {
      if (!source || !target) return Promise.reject("Book not found");
      source.grids = source.grids.filter((id) => !set.has(id));
      const targetSet = new Set(target.grids);
      grids
        .filter((id) => !targetSet.has(id))
        .forEach((id) => target.grids.push(id));
      return Promise.all(
        [source, target].map((book) => this.db.pushBook(book))
      );
    });
  }

  reuseGrids(grids: string[], targetBook: string) {
    this.db.getBook(targetBook).then((book) => {
      if (!book) return Promise.reject("Book not found");
      const targetSet = new Set(book.grids);
      grids
        .filter((id) => !targetSet.has(id))
        .forEach((id) => book.grids.push(id));
      return this.db.pushBook(book);
    });
  }

  pushGridToBook(bookId: string, gridId: string) {
    return this.db.getBook(bookId).then((book) => {
      if (!book) {
        return Promise.reject("book not found");
      }
      book.grids.push(gridId);
      return this.db.updateBook(book);
    });
  }

  deleteGridFromBook(bookId: string, gridId: string) {
    return this.db.getBook(bookId).then((book) => {
      if (!book) {
        return Promise.reject("book not found");
      }
      book.grids = book.grids.filter((id) => id !== gridId);
      return this.db.updateBook(book);
    });
  }
  deleteGridsFromBook(bookId: string, gridIds: string[]) {
    return this.db.getBook(bookId).then((book) => {
      if (!book) {
        return Promise.reject("book not found");
      }
      const idsSet = new Set(gridIds);
      book.grids = book.grids.filter((id) => !idsSet.has(id));
      return this.db.updateBook(book);
    });
  }

  getUserDefinitions(gridids?: string[]) {
    const res = new Map<string, Set<string>>();
    const idsSet = new Set(gridids || []);
    return this.getGrids().then((grids) => {
      grids
        .filter((grid) =>
          gridids && gridids.length ? idsSet.has(grid.id) : true
        )
        .forEach((grid) => {
          getDefinitions(grid, res);
        });
      return res;
    });
  }

  deleteStyles(ids: string[]) {
    const set = new Set(ids);
    set.delete("default");
    set.delete("solution");
    return this.db
      .getBooks()
      .then((books) =>
        Promise.all(
          books.map((book) => {
            let shouldSave = false;
            if (set.has(book.style)) {
              shouldSave = true;
              book.style = "default";
            }
            if (set.has(book.solutionStyle)) {
              shouldSave = true;
              book.solutionStyle = "solution";
            }
            if (shouldSave) {
              return this.db.updateBook(book);
            }
            return Promise.resolve();
          })
        )
      )
      .then(() => Promise.all([...ids].map((id) => this.db.deleteStyle(id))));
  }

  deleteGrids(ids: string[]) {
    const idsSet = new Set(ids);
    return this.db
      .getBooks()
      .then((books) =>
        Promise.all(
          books.map((book) => {
            const l = book.grids.length;
            book.grids = book.grids.filter((g) => !idsSet.has(g));
            if (l === book.grids.length) return;
            return this.db.updateBook(book);
          })
        )
      )
      .then(() => Promise.all(ids.map((id) => this.db.deleteGrid(id))));
  }

  _saveGrid(grid: Grid | GridState) {
    return this.db.pushGrid(grid instanceof Grid ? grid.serialize() : grid);
  }
  saveGrid(grid: Grid | GridState) {
    return this._saveGrid(grid);
  }
  _saveStyle(style: GridStyle | SolutionStyle) {
    return this.db.pushStyle(style);
  }
  saveStyle(style: GridStyle | SolutionStyle) {
    return this._saveStyle(style);
  }

  isSignedIn() {
    const mode = localStorage.getItem("db-mode");
    if (mode === "idb") return Promise.resolve(true);
    if (mode === "remote") return this.remote.isSignedIn();
    if (mode === "supadb") return this.supadb.isSignedIn();
    return Promise.resolve(false);
  }

  signout() {
    const prevMode = this.mode;
    localStorage.removeItem("db-mode");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    this._mode = "idb";
    if (prevMode === "supadb") {
      return this.supadb.supabase.auth.signOut();
    } else if (prevMode === "remote") {
      return this.remote.logout();
    }
    return Promise.resolve();
  }

  /**
   * Silently sync local IndexedDB ↔ remote after login.
   * - Items with timestamps (books, fonts): keep the most recently updated version in both stores.
   * - Items without timestamps (grids, styles): remote is authoritative; local-only items are pushed up.
   * - Words / bannedWords (plain strings): union both sets.
   */
  async syncOnLogin() {
    const [[idbGrids, remoteGrids], [idbBooks, remoteBooks], [idbStyles, remoteStyles], [idbWords, remoteWords], [idbBanned, remoteBanned], [idbFonts, remoteFonts]] =
      await Promise.all([
        Promise.all([this.idb.getGrids(), this.remote.getGrids()]),
        Promise.all([this.idb.getBooks(), this.remote.getBooks()]),
        Promise.all([this.idb.getStyles(), this.remote.getStyles()]),
        Promise.all([this.idb.getWords(), this.remote.getWords()]),
        Promise.all([this.idb.getBannedWords(), this.remote.getBannedWords()]),
        Promise.all([this.idb.getFonts(), this.remote.getFonts()]),
      ]);

    const ops: Promise<unknown>[] = [];

    // --- Grids (no updated field — remote wins for conflicts) ---
    const remoteGridIds = new Set(remoteGrids.map((g: GridState) => g.id));
    for (const g of idbGrids) {
      if (!remoteGridIds.has(g.id)) ops.push(this.remote.pushGrid(g));
    }
    for (const g of remoteGrids) {
      ops.push(this.idb.pushGrid(g)); // upsert: remote overwrites local
    }

    // --- Books (compare updated timestamp) ---
    const remoteBookMap = new Map(remoteBooks.map((b: Book) => [b.id, b]));
    for (const local of idbBooks as Book[]) {
      const remote = remoteBookMap.get(local.id);
      if (!remote) {
        ops.push(this.remote.pushBook(local));
      } else if (local.updated > remote.updated) {
        ops.push(this.remote.pushBook(local));
        ops.push(this.idb.pushBook(local)); // already local, no-op effectively
      } else {
        ops.push(this.idb.pushBook(remote));
      }
    }
    for (const remote of remoteBooks as Book[]) {
      if (!idbBooks.find((b: Book) => b.id === remote.id)) {
        ops.push(this.idb.pushBook(remote));
      }
    }

    // --- Styles (no updated field — remote wins for conflicts) ---
    const remoteStyleIds = new Set(remoteStyles.map((s: GridStyle) => s.id));
    for (const s of idbStyles as GridStyle[]) {
      if (!remoteStyleIds.has(s.id)) ops.push(this.remote.pushStyle(s));
    }
    for (const s of remoteStyles as GridStyle[]) {
      ops.push(this.idb.pushStyle(s)); // upsert
    }

    // --- Fonts (compare updated timestamp) ---
    const remoteFontMap = new Map(remoteFonts.map((f: Font) => [f.family, f]));
    for (const local of idbFonts as Font[]) {
      const remote = remoteFontMap.get(local.family);
      if (!remote) {
        ops.push(this.remote.pushFont(local));
      } else if (local.updated > remote.updated) {
        ops.push(this.remote.pushFont(local));
      } else {
        ops.push(this.idb.pushFont(remote));
      }
    }
    for (const remote of remoteFonts as Font[]) {
      if (!idbFonts.find((f: Font) => f.family === remote.family)) {
        ops.push(this.idb.pushFont(remote));
      }
    }

    // --- Words / BannedWords (union) ---
    const idbWordSet = new Set(idbWords as string[]);
    const remoteWordSet = new Set(remoteWords as string[]);
    for (const w of idbWordSet) if (!remoteWordSet.has(w)) ops.push(this.remote.pushWord(w));
    for (const w of remoteWordSet) if (!idbWordSet.has(w)) ops.push(this.idb.pushWord(w));

    const idbBannedSet = new Set(idbBanned as string[]);
    const remoteBannedSet = new Set(remoteBanned as string[]);
    for (const w of idbBannedSet) if (!remoteBannedSet.has(w)) ops.push(this.remote.pushBannedWord(w));
    for (const w of remoteBannedSet) if (!idbBannedSet.has(w)) ops.push(this.idb.pushBannedWord(w));

    await Promise.allSettled(ops);
  }
}

export const api = new API(localStorage.getItem("db-mode") || "idb");
// add throttled saveGrid function to the api
api.saveGrid = throttle(api._saveGrid, 50);
api.saveStyle = throttle(api._saveStyle, 50);
