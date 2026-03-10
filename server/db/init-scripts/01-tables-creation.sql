-- ============================
-- Users Table (Modified)
-- ============================
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    stripe_id VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    pseudo VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    last_connection TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    disk_usage BIGINT DEFAULT 0,
    tier_id INTEGER DEFAULT 1,
    refresh_token TEXT,                          -- Stores the latest refresh token
    refresh_token_expires_at TIMESTAMP           -- Stores expiration date of the refresh token
);

-- ============================
-- Groups Table
-- ============================
CREATE TABLE Groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    owner_id INTEGER NOT NULL,
    disk_usage BIGINT DEFAULT 0,
    tier_id INTEGER DEFAULT 1,
    expires_at TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- ============================
-- GroupMembers Table
-- ============================
CREATE TABLE GroupMembers (
    user_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    role VARCHAR(20) DEFAULT 'member',
    PRIMARY KEY (user_id, group_id),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES Groups(id) ON DELETE CASCADE
);

-- ============================
-- Crosswords (Grids) Table
-- ============================
CREATE TABLE Crosswords (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    version INTEGER DEFAULT 1,
    user_id INTEGER,
    group_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL,
    FOREIGN KEY (group_id) REFERENCES Groups(id) ON DELETE SET NULL,
    CHECK (user_id IS NOT NULL OR group_id IS NOT NULL)
);

-- ============================
-- Words Table
-- ============================
CREATE TABLE Words (
    id SERIAL PRIMARY KEY,
    word VARCHAR(255) NOT NULL,
    definition TEXT NOT NULL,
    language VARCHAR(10) NOT NULL,
    user_id INTEGER,
    group_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL,
    FOREIGN KEY (group_id) REFERENCES Groups(id) ON DELETE SET NULL,
    CHECK (user_id IS NOT NULL OR group_id IS NOT NULL)
);

-- ============================
-- CustomWords Table
-- ============================
CREATE TABLE CustomWords (
    id SERIAL PRIMARY KEY,
    word VARCHAR(255) NOT NULL,
    user_id INTEGER,
    group_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL,
    FOREIGN KEY (group_id) REFERENCES Groups(id) ON DELETE SET NULL,
    CHECK (user_id IS NOT NULL OR group_id IS NOT NULL)
);

-- ============================
-- BannedWords Table
-- ============================
CREATE TABLE BannedWords (
    id SERIAL PRIMARY KEY,
    word VARCHAR(255) NOT NULL,
    user_id INTEGER,
    group_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL,
    FOREIGN KEY (group_id) REFERENCES Groups(id) ON DELETE SET NULL,
    CHECK (user_id IS NOT NULL OR group_id IS NOT NULL)
);

-- ============================
-- WordLists (Themes) Table
-- ============================
CREATE TABLE WordLists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    words JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    version INTEGER DEFAULT 1,
    user_id INTEGER,
    group_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL,
    FOREIGN KEY (group_id) REFERENCES Groups(id) ON DELETE SET NULL,
    CHECK (user_id IS NOT NULL OR group_id IS NOT NULL)
);

-- ============================
-- Images Table
-- ============================
CREATE TABLE Images (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    user_id INTEGER,
    group_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL,
    FOREIGN KEY (group_id) REFERENCES Groups(id) ON DELETE SET NULL
);

-- ============================
-- Books Table
-- ============================
CREATE TABLE Books (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    grid_ids JSONB NOT NULL,
    user_id INTEGER,
    group_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL,
    FOREIGN KEY (group_id) REFERENCES Groups(id) ON DELETE SET NULL,
    CHECK (user_id IS NOT NULL OR group_id IS NOT NULL)
);

-- ============================
-- Payments Table
-- ============================
CREATE TABLE Payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    group_id INTEGER,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    payment_for VARCHAR(20) DEFAULT 'user',
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL,
    FOREIGN KEY (group_id) REFERENCES Groups(id) ON DELETE SET NULL
);

-- ============================
-- TokenBlacklist Table
-- ============================

CREATE TABLE TokenBlacklist (
    id SERIAL PRIMARY KEY,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL
);

-- ============================
-- Fonts Table
-- ============================
CREATE TABLE Fonts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    file_url TEXT NOT NULL,
    user_id INTEGER,
    group_id INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL,
    FOREIGN KEY (group_id) REFERENCES Groups(id) ON DELETE SET NULL,
    CHECK (user_id IS NOT NULL OR group_id IS NOT NULL)
);

-- ============================
-- Indexes for Fonts Table
-- ============================
CREATE INDEX idx_fonts_name ON Fonts(name);
CREATE INDEX idx_fonts_user ON Fonts(user_id);
CREATE INDEX idx_fonts_group ON Fonts(group_id);


-- ============================
-- Styles Table
-- ============================
CREATE TABLE Styles (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR(255) NOT NULL,
    data JSONB NOT NULL,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL
);

CREATE INDEX idx_styles_client_user ON Styles(client_id, user_id);
CREATE INDEX idx_styles_user ON Styles(user_id);

-- ============================
-- StyleShares Table (many-to-many: a style can be shared to multiple groups)
-- ============================
CREATE TABLE StyleShares (
    style_id INTEGER NOT NULL REFERENCES Styles(id) ON DELETE CASCADE,
    group_id INTEGER NOT NULL REFERENCES Groups(id) ON DELETE CASCADE,
    PRIMARY KEY (style_id, group_id)
);

CREATE INDEX idx_styleshares_group ON StyleShares(group_id);

-- ============================
-- YDocUpdates Table (Yjs collaboration state — one row per active grid)
-- ============================
CREATE TABLE YDocUpdates (
    id          SERIAL PRIMARY KEY,
    doc_name    VARCHAR(255) NOT NULL UNIQUE,
    update      BYTEA NOT NULL,
    updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ydocupdates_updated ON YDocUpdates(updated_at);

-- ============================
-- Indexes and Optimizations
-- ============================
CREATE INDEX idx_words_word ON Words(word);
CREATE INDEX idx_customwords_word ON CustomWords(word);
CREATE INDEX idx_wordlists_user ON WordLists(user_id);
CREATE INDEX idx_wordlists_group ON WordLists(group_id);
CREATE INDEX idx_tokens_token ON TokenBlacklist(token);
