-- Shadowdark Solo GM Database Schema
-- Run this in your Supabase SQL editor to set up the database

-- === GLOBAL TABLES (shared across all sessions) ===

-- Global monster catalog
CREATE TABLE IF NOT EXISTS monsters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    armor_class INTEGER,
    hit_points TEXT, -- e.g., "2d6+2"
    speed TEXT,
    abilities JSONB, -- Stats object
    attacks TEXT[],
    special_abilities TEXT[],
    challenge_rating INTEGER,
    source TEXT DEFAULT 'shadowdark_core' CHECK (source IN ('shadowdark_core', 'custom')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- === SESSION-SPECIFIC TABLES ===

-- Main game sessions
CREATE TABLE IF NOT EXISTS game_sessions (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    character_data JSONB,
    chaos_factor INTEGER DEFAULT 5,
    scene_counter INTEGER DEFAULT 1,
    shadowdark_theme TEXT DEFAULT 'Dark Fantasy',
    shadowdark_tone TEXT DEFAULT 'Mysterious',
    shadowdark_voice TEXT DEFAULT 'Atmospheric',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adventure arcs (BBEG and main story)
CREATE TABLE IF NOT EXISTS adventure_arcs (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    bbeg_name TEXT NOT NULL,
    bbeg_description TEXT,
    bbeg_motivation TEXT,
    bbeg_hook TEXT,
    high_tower_surprise TEXT,
    minion_monster_id TEXT REFERENCES monsters(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- NPCs (includes lieutenants)
CREATE TABLE IF NOT EXISTS npcs (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    adventure_arc_id TEXT REFERENCES adventure_arcs(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    disposition TEXT DEFAULT 'unknown' CHECK (disposition IN ('friendly', 'neutral', 'hostile', 'unknown')),
    role TEXT DEFAULT 'other' CHECK (role IN ('bbeg', 'lieutenant', 'ally', 'neutral', 'enemy', 'other')),
    tarot_spread JSONB, -- For lieutenants
    hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Factions
CREATE TABLE IF NOT EXISTS factions (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    adventure_arc_id TEXT REFERENCES adventure_arcs(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    influence TEXT DEFAULT 'minor' CHECK (influence IN ('minor', 'moderate', 'major')),
    relationship TEXT DEFAULT 'unknown' CHECK (relationship IN ('allied', 'neutral', 'opposed', 'unknown')),
    hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plot threads
CREATE TABLE IF NOT EXISTS threads (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    adventure_arc_id TEXT REFERENCES adventure_arcs(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'dormant')),
    hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clues
CREATE TABLE IF NOT EXISTS clues (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    adventure_arc_id TEXT REFERENCES adventure_arcs(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    discovered BOOLEAN DEFAULT FALSE,
    importance TEXT DEFAULT 'minor' CHECK (importance IN ('minor', 'moderate', 'major')),
    hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session-specific monster instances
CREATE TABLE IF NOT EXISTS session_monsters (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    monster_id TEXT NOT NULL REFERENCES monsters(id),
    name TEXT, -- Can override monster name
    current_hit_points INTEGER,
    status TEXT DEFAULT 'alive' CHECK (status IN ('alive', 'dead', 'fled', 'unknown')),
    notes TEXT,
    hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adventure log entries
CREATE TABLE IF NOT EXISTS adventure_log (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    scene_number INTEGER,
    content TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    chaos_factor INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('user', 'assistant', 'gm', 'system')),
    content TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view their own sessions" ON game_sessions
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own sessions" ON game_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own sessions" ON game_sessions
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own sessions" ON game_sessions
    FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_game_sessions_updated_at
    BEFORE UPDATE ON game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_updated_at ON game_sessions(updated_at);

-- Optional: Create a view for easier querying
CREATE OR REPLACE VIEW user_sessions AS
SELECT
    id,
    character_data,
    adventure_arc,
    campaign_elements,
    adventure_log,
    chaos_factor,
    theme,
    tone,
    voice,
    created_at,
    updated_at
FROM game_sessions
WHERE user_id = auth.uid() OR user_id IS NULL;
