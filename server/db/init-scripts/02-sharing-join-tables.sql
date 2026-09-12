-- ============================================================
-- Migration: Replace group_id columns with sharing join tables
-- Apply manually to existing DBs. Fresh DBs use 01-tables-creation.sql.
-- ============================================================

-- 1. Create join tables (idempotent)

CREATE TABLE IF NOT EXISTS CrosswordShares (
    crossword_id INTEGER NOT NULL REFERENCES Crosswords(id) ON DELETE CASCADE,
    group_id     INTEGER NOT NULL REFERENCES Groups(id)     ON DELETE CASCADE,
    PRIMARY KEY (crossword_id, group_id)
);
CREATE INDEX IF NOT EXISTS idx_crosswordshares_group ON CrosswordShares(group_id);

CREATE TABLE IF NOT EXISTS BookShares (
    book_id  INTEGER NOT NULL REFERENCES Books(id)  ON DELETE CASCADE,
    group_id INTEGER NOT NULL REFERENCES Groups(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, group_id)
);
CREATE INDEX IF NOT EXISTS idx_bookshares_group ON BookShares(group_id);

CREATE TABLE IF NOT EXISTS WordListShares (
    wordlist_id INTEGER NOT NULL REFERENCES WordLists(id) ON DELETE CASCADE,
    group_id    INTEGER NOT NULL REFERENCES Groups(id)    ON DELETE CASCADE,
    PRIMARY KEY (wordlist_id, group_id)
);
CREATE INDEX IF NOT EXISTS idx_wordlistshares_group ON WordListShares(group_id);

CREATE TABLE IF NOT EXISTS FontShares (
    font_id  INTEGER NOT NULL REFERENCES Fonts(id)  ON DELETE CASCADE,
    group_id INTEGER NOT NULL REFERENCES Groups(id) ON DELETE CASCADE,
    PRIMARY KEY (font_id, group_id)
);
CREATE INDEX IF NOT EXISTS idx_fontshares_group ON FontShares(group_id);

-- 2. Migrate existing group_id data into join tables

INSERT INTO CrosswordShares (crossword_id, group_id)
    SELECT id, group_id FROM Crosswords WHERE group_id IS NOT NULL
    ON CONFLICT DO NOTHING;

INSERT INTO BookShares (book_id, group_id)
    SELECT id, group_id FROM Books WHERE group_id IS NOT NULL
    ON CONFLICT DO NOTHING;

INSERT INTO WordListShares (wordlist_id, group_id)
    SELECT id, group_id FROM WordLists WHERE group_id IS NOT NULL
    ON CONFLICT DO NOTHING;

INSERT INTO FontShares (font_id, group_id)
    SELECT id, group_id FROM Fonts WHERE group_id IS NOT NULL
    ON CONFLICT DO NOTHING;

-- 3. Drop old indexes and columns

DROP INDEX IF EXISTS idx_wordlists_group;
DROP INDEX IF EXISTS idx_fonts_group;

ALTER TABLE Crosswords DROP COLUMN IF EXISTS group_id;
ALTER TABLE Books       DROP COLUMN IF EXISTS group_id;
ALTER TABLE WordLists   DROP COLUMN IF EXISTS group_id;
ALTER TABLE Fonts       DROP COLUMN IF EXISTS group_id;
