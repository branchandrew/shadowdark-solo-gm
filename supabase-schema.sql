-- Shadowdark Solo GM Database Schema
-- Run this in your Supabase SQL editor to set up the database

-- Create game_sessions table
CREATE TABLE IF NOT EXISTS game_sessions (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid(),
    character_data JSONB,
    adventure_arc JSONB,
    campaign_elements JSONB DEFAULT '{"threads": [], "characters": [], "factions": [], "clues": []}'::jsonb,
    adventure_log JSONB DEFAULT '[]'::jsonb,
    chaos_factor INTEGER DEFAULT 5,
    theme TEXT DEFAULT 'Dark Fantasy',
    tone TEXT DEFAULT 'Mysterious', 
    voice TEXT DEFAULT 'Atmospheric',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
