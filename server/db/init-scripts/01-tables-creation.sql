-- ============================
-- Tiers (Paying Tiers) Table
-- ============================
CREATE TABLE Tiers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    max_users INTEGER DEFAULT 1,
    max_grids INTEGER,
    max_custom_words INTEGER,
    max_disk_usage BIGINT DEFAULT 104857600,
    features JSONB
);
-- ============================
-- Users Table (Modified)
-- ============================
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_connection TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    disk_usage BIGINT DEFAULT 0,
    tier_id INTEGER DEFAULT 1,
    refresh_token TEXT,                          -- Stores the latest refresh token
    refresh_token_expires_at TIMESTAMP,           -- Stores expiration date of the refresh token
    FOREIGN KEY (tier_id) REFERENCES Tiers(id)
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
    FOREIGN KEY (owner_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (tier_id) REFERENCES Tiers(id)
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
    definition TEXT,
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
-- Indexes and Optimizations
-- ============================
CREATE INDEX idx_words_word ON Words(word);
CREATE INDEX idx_customwords_word ON CustomWords(word);
CREATE INDEX idx_wordlists_user ON WordLists(user_id);
CREATE INDEX idx_wordlists_group ON WordLists(group_id);
CREATE INDEX idx_tokens_token ON TokenBlacklist(token);
