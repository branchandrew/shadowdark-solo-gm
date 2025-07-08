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

-- === ROW LEVEL SECURITY ===

-- Enable RLS on all tables
ALTER TABLE monsters ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE adventure_arcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE npcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE factions ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE clues ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_monsters ENABLE ROW LEVEL SECURITY;
ALTER TABLE adventure_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Global monsters table - readable by all, writable by authenticated users
CREATE POLICY "Anyone can view monsters" ON monsters FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert monsters" ON monsters FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update monsters" ON monsters FOR UPDATE USING (auth.uid() IS NOT NULL);

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
CREATE POLICY "Users can access their session data" ON adventure_arcs
    FOR ALL USING (EXISTS (
        SELECT 1 FROM game_sessions gs
        WHERE gs.id = adventure_arcs.session_id
        AND (gs.user_id = auth.uid() OR gs.user_id IS NULL)
    ));

CREATE POLICY "Users can access their session npcs" ON npcs
    FOR ALL USING (EXISTS (
        SELECT 1 FROM game_sessions gs
        WHERE gs.id = npcs.session_id
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

CREATE POLICY "Users can access their session monsters" ON session_monsters
    FOR ALL USING (EXISTS (
        SELECT 1 FROM game_sessions gs
        WHERE gs.id = session_monsters.session_id
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
CREATE TRIGGER update_monsters_updated_at BEFORE UPDATE ON monsters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_game_sessions_updated_at BEFORE UPDATE ON game_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_adventure_arcs_updated_at BEFORE UPDATE ON adventure_arcs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_npcs_updated_at BEFORE UPDATE ON npcs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_factions_updated_at BEFORE UPDATE ON factions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_threads_updated_at BEFORE UPDATE ON threads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clues_updated_at BEFORE UPDATE ON clues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_session_monsters_updated_at BEFORE UPDATE ON session_monsters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_adventure_log_updated_at BEFORE UPDATE ON adventure_log FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- === INDEXES ===

-- Game sessions
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_updated_at ON game_sessions(updated_at);

-- Foreign key indexes for better JOIN performance
CREATE INDEX IF NOT EXISTS idx_adventure_arcs_session_id ON adventure_arcs(session_id);
CREATE INDEX IF NOT EXISTS idx_npcs_session_id ON npcs(session_id);
CREATE INDEX IF NOT EXISTS idx_npcs_adventure_arc_id ON npcs(adventure_arc_id);
CREATE INDEX IF NOT EXISTS idx_factions_session_id ON factions(session_id);
CREATE INDEX IF NOT EXISTS idx_factions_adventure_arc_id ON factions(adventure_arc_id);
CREATE INDEX IF NOT EXISTS idx_threads_session_id ON threads(session_id);
CREATE INDEX IF NOT EXISTS idx_clues_session_id ON clues(session_id);
CREATE INDEX IF NOT EXISTS idx_session_monsters_session_id ON session_monsters(session_id);
CREATE INDEX IF NOT EXISTS idx_session_monsters_monster_id ON session_monsters(monster_id);
CREATE INDEX IF NOT EXISTS idx_adventure_log_session_id ON adventure_log(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);

-- === SAMPLE DATA ===

-- Insert core Shadowdark monsters
INSERT INTO monsters (id, name, description, armor_class, hit_points, speed, abilities, attacks, special_abilities, challenge_rating, source) VALUES
('shadowdark_goblin', 'Goblin', 'Small, cunning humanoids with sharp teeth and pointed ears.', 12, '1d6', '30 ft', '{"STR": 8, "DEX": 14, "CON": 10, "INT": 10, "WIS": 8, "CHA": 8}', ARRAY['Shortsword: +4 (N), 1d6+2'], ARRAY['Darkvision 60 ft'], 1, 'shadowdark_core'),
('shadowdark_orc', 'Orc', 'Brutal humanoids with tusks and a love of violence.', 13, '2d6+2', '30 ft', '{"STR": 16, "DEX": 12, "CON": 14, "INT": 8, "WIS": 11, "CHA": 10}', ARRAY['Greataxe: +5 (N), 1d12+3'], ARRAY['Darkvision 60 ft'], 2, 'shadowdark_core'),
('shadowdark_skeleton', 'Skeleton', 'Animated bones held together by dark magic.', 13, '2d6', '30 ft', '{"STR": 10, "DEX": 14, "CON": 10, "INT": 6, "WIS": 8, "CHA": 5}', ARRAY['Shortsword: +4 (N), 1d6+2'], ARRAY['Immune to exhaustion, poison'], 1, 'shadowdark_core'),
('shadowdark_zombie', 'Zombie', 'Shambling undead with rotting flesh.', 8, '3d6+3', '20 ft', '{"STR": 13, "DEX": 6, "CON": 16, "INT": 3, "WIS": 6, "CHA": 5}', ARRAY['Slam: +3 (N), 1d6+1'], ARRAY['Immune to exhaustion, poison'], 1, 'shadowdark_core')
ON CONFLICT (id) DO NOTHING;
