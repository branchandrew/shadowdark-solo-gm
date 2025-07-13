-- Shadowdark Solo GM Database Schema
-- Run this in your Supabase SQL editor to set up the database

-- === GLOBAL TABLES (shared across all sessions) ===

-- Global creature templates (mainly for official Shadowdark monsters)
CREATE TABLE IF NOT EXISTS creature_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    race_species TEXT,
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
    high_tower_surprise TEXT, -- Major plot twist for final confrontation
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: adventure_arcs table removed - BBEG details now in creatures table, high_tower_surprise moved to game_sessions

-- Unified creatures table (BBEG, Lieutenants, Monsters, NPCs)
CREATE TABLE IF NOT EXISTS creatures (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,

    -- Common creature attributes
    name TEXT NOT NULL,
    race_species TEXT,
    description TEXT,

    -- Shadowdark stats (standard for all creatures)
    armor_class INTEGER DEFAULT 10,
    hit_points TEXT, -- e.g., "2d6+2" or actual number
    current_hit_points INTEGER, -- For tracking damage in session
    speed TEXT DEFAULT '30 ft',
    abilities JSONB, -- Stats object {STR, DEX, CON, INT, WIS, CHA}
    attacks TEXT[] DEFAULT '{}',
    special_abilities TEXT[] DEFAULT '{}',
    challenge_rating INTEGER,

    -- Creature type and status
    creature_type TEXT NOT NULL CHECK (creature_type IN ('bbeg', 'lieutenant', 'monster', 'npc')),
    status TEXT DEFAULT 'alive' CHECK (status IN ('alive', 'dead', 'fled', 'unknown')),
    hidden BOOLEAN DEFAULT FALSE,

    -- Type-specific fields (conditional based on creature_type)

    -- BBEG-specific fields
    bbeg_motivation TEXT,
    bbeg_hook TEXT,
    minion_creature_id TEXT REFERENCES creatures(id) ON DELETE SET NULL, -- FK to minion creature

    -- Lieutenant-specific fields (tarot spread results, not the spread itself)
    lieutenant_seed TEXT,
    lieutenant_occupation TEXT,
    lieutenant_background TEXT,
    lieutenant_why_protect TEXT,
    lieutenant_how_protect TEXT,

    -- Monster-specific fields
    is_minion BOOLEAN DEFAULT FALSE,
    source TEXT CHECK (source IN ('shadowdark_core', 'custom')),

    -- NPC-specific fields
    npc_disposition TEXT CHECK (npc_disposition IN ('friendly', 'neutral', 'hostile', 'unknown')),
    npc_role TEXT CHECK (npc_role IN ('ally', 'neutral', 'enemy', 'merchant', 'guard', 'villager', 'other')),

    -- Common optional fields
    faction_id TEXT REFERENCES factions(id) ON DELETE SET NULL,
    notes TEXT,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Factions
CREATE TABLE IF NOT EXISTS factions (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
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
    description TEXT NOT NULL,
    discovered BOOLEAN DEFAULT FALSE,
    importance TEXT DEFAULT 'minor' CHECK (importance IN ('minor', 'moderate', 'major')),
    hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: session_monsters table removed - now part of unified creatures table

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

-- === ROW LEVEL SECURITY ===

-- Enable RLS on all tables
ALTER TABLE creature_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE creatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE factions ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE clues ENABLE ROW LEVEL SECURITY;
ALTER TABLE adventure_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Global creature templates - readable by all, writable by authenticated users
CREATE POLICY "Anyone can view creature templates" ON creature_templates FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert creature templates" ON creature_templates FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update creature templates" ON creature_templates FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Game sessions - users can only access their own
CREATE POLICY "Users can view their own sessions" ON game_sessions
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can insert their own sessions" ON game_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update their own sessions" ON game_sessions
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can delete their own sessions" ON game_sessions
    FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Session-specific tables - access based on session ownership
CREATE POLICY "Users can access their session creatures" ON creatures
    FOR ALL USING (EXISTS (
        SELECT 1 FROM game_sessions gs
        WHERE gs.id = creatures.session_id
        AND (gs.user_id = auth.uid() OR gs.user_id IS NULL)
    ));

CREATE POLICY "Users can access their session factions" ON factions
    FOR ALL USING (EXISTS (
        SELECT 1 FROM game_sessions gs
        WHERE gs.id = factions.session_id
        AND (gs.user_id = auth.uid() OR gs.user_id IS NULL)
    ));

CREATE POLICY "Users can access their session threads" ON threads
    FOR ALL USING (EXISTS (
        SELECT 1 FROM game_sessions gs
        WHERE gs.id = threads.session_id
        AND (gs.user_id = auth.uid() OR gs.user_id IS NULL)
    ));

CREATE POLICY "Users can access their session clues" ON clues
    FOR ALL USING (EXISTS (
        SELECT 1 FROM game_sessions gs
        WHERE gs.id = clues.session_id
        AND (gs.user_id = auth.uid() OR gs.user_id IS NULL)
    ));

CREATE POLICY "Users can access their session logs" ON adventure_log
    FOR ALL USING (EXISTS (
        SELECT 1 FROM game_sessions gs
        WHERE gs.id = adventure_log.session_id
        AND (gs.user_id = auth.uid() OR gs.user_id IS NULL)
    ));

CREATE POLICY "Users can access their session chat" ON chat_messages
    FOR ALL USING (EXISTS (
        SELECT 1 FROM game_sessions gs
        WHERE gs.id = chat_messages.session_id
        AND (gs.user_id = auth.uid() OR gs.user_id IS NULL)
    ));

-- === TRIGGERS ===

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_creature_templates_updated_at BEFORE UPDATE ON creature_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_game_sessions_updated_at BEFORE UPDATE ON game_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_creatures_updated_at BEFORE UPDATE ON creatures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_factions_updated_at BEFORE UPDATE ON factions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_threads_updated_at BEFORE UPDATE ON threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clues_updated_at BEFORE UPDATE ON clues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_adventure_log_updated_at BEFORE UPDATE ON adventure_log FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- === INDEXES ===

-- Game sessions
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_updated_at ON game_sessions(updated_at);

-- Foreign key indexes for better JOIN performance
CREATE INDEX IF NOT EXISTS idx_creatures_session_id ON creatures(session_id);
CREATE INDEX IF NOT EXISTS idx_creatures_creature_type ON creatures(creature_type);
CREATE INDEX IF NOT EXISTS idx_creatures_faction_id ON creatures(faction_id);
CREATE INDEX IF NOT EXISTS idx_creatures_minion_creature_id ON creatures(minion_creature_id);
CREATE INDEX IF NOT EXISTS idx_factions_session_id ON factions(session_id);
CREATE INDEX IF NOT EXISTS idx_threads_session_id ON threads(session_id);
CREATE INDEX IF NOT EXISTS idx_clues_session_id ON clues(session_id);
CREATE INDEX IF NOT EXISTS idx_adventure_log_session_id ON adventure_log(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);

-- === SAMPLE DATA ===

-- Insert core Shadowdark creature templates
INSERT INTO creature_templates (id, name, race_species, description, armor_class, hit_points, speed, abilities, attacks, special_abilities, challenge_rating, source) VALUES
('shadowdark_goblin', 'Goblin', 'Goblin', 'Small, cunning humanoids with sharp teeth and pointed ears.', 12, '1d6', '30 ft', '{"STR": 8, "DEX": 14, "CON": 10, "INT": 10, "WIS": 8, "CHA": 8}', ARRAY['Shortsword: +4 (N), 1d6+2'], ARRAY['Darkvision 60 ft'], 1, 'shadowdark_core'),
('shadowdark_orc', 'Orc', 'Orc', 'Brutal humanoids with tusks and a love of violence.', 13, '2d6+2', '30 ft', '{"STR": 16, "DEX": 12, "CON": 14, "INT": 8, "WIS": 11, "CHA": 10}', ARRAY['Greataxe: +5 (N), 1d12+3'], ARRAY['Darkvision 60 ft'], 2, 'shadowdark_core'),
('shadowdark_skeleton', 'Skeleton', 'Undead', 'Animated bones held together by dark magic.', 13, '2d6', '30 ft', '{"STR": 10, "DEX": 14, "CON": 10, "INT": 6, "WIS": 8, "CHA": 5}', ARRAY['Shortsword: +4 (N), 1d6+2'], ARRAY['Immune to exhaustion, poison'], 1, 'shadowdark_core'),
('shadowdark_zombie', 'Zombie', 'Undead', 'Shambling undead with rotting flesh.', 8, '3d6+3', '20 ft', '{"STR": 13, "DEX": 6, "CON": 16, "INT": 3, "WIS": 6, "CHA": 5}', ARRAY['Slam: +3 (N), 1d6+1'], ARRAY['Immune to exhaustion, poison'], 1, 'shadowdark_core')
ON CONFLICT (id) DO NOTHING;
