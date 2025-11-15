-- Supabase Database Schema for Freetar
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabs table - stores complete tab content
CREATE TABLE IF NOT EXISTS tabs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tab_url TEXT NOT NULL UNIQUE,
    artist_name TEXT NOT NULL,
    song_name TEXT NOT NULL,
    type TEXT NOT NULL,
    version INTEGER DEFAULT 1,
    votes INTEGER DEFAULT 0,
    rating NUMERIC DEFAULT 0,
    difficulty TEXT,
    tuning TEXT,
    capo INTEGER,
    tab_content TEXT NOT NULL,
    chords JSONB,
    fingers_for_strings JSONB,
    alternatives JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Favorites table (now references tabs table)
CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    tab_id UUID REFERENCES tabs(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, tab_id)
);

-- Setlists table
CREATE TABLE IF NOT EXISTS setlists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Setlist items table (now references tabs table)
CREATE TABLE IF NOT EXISTS setlist_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    setlist_id UUID REFERENCES setlists(id) ON DELETE CASCADE NOT NULL,
    tab_id UUID REFERENCES tabs(id) ON DELETE CASCADE NOT NULL,
    position INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(setlist_id, tab_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS tabs_tab_url_idx ON tabs(tab_url);
CREATE INDEX IF NOT EXISTS tabs_artist_song_idx ON tabs(artist_name, song_name);
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_tab_id_idx ON favorites(tab_id);
CREATE INDEX IF NOT EXISTS favorites_created_at_idx ON favorites(created_at DESC);
CREATE INDEX IF NOT EXISTS setlists_user_id_idx ON setlists(user_id);
CREATE INDEX IF NOT EXISTS setlist_items_setlist_id_idx ON setlist_items(setlist_id);
CREATE INDEX IF NOT EXISTS setlist_items_tab_id_idx ON setlist_items(tab_id);
CREATE INDEX IF NOT EXISTS setlist_items_position_idx ON setlist_items(setlist_id, position);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE setlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE setlist_items ENABLE ROW LEVEL SECURITY;

-- Tabs policies (readable by all, writable by authenticated users)
CREATE POLICY "Anyone can view tabs"
    ON tabs FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert tabs"
    ON tabs FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update tabs"
    ON tabs FOR UPDATE
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Favorites policies
CREATE POLICY "Users can view their own favorites"
    ON favorites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites"
    ON favorites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorites"
    ON favorites FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
    ON favorites FOR DELETE
    USING (auth.uid() = user_id);

-- Setlists policies
CREATE POLICY "Users can view their own setlists"
    ON setlists FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own setlists"
    ON setlists FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own setlists"
    ON setlists FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own setlists"
    ON setlists FOR DELETE
    USING (auth.uid() = user_id);

-- Setlist items policies
CREATE POLICY "Users can view their own setlist items"
    ON setlist_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM setlists
            WHERE setlists.id = setlist_items.setlist_id
            AND setlists.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own setlist items"
    ON setlist_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM setlists
            WHERE setlists.id = setlist_items.setlist_id
            AND setlists.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own setlist items"
    ON setlist_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM setlists
            WHERE setlists.id = setlist_items.setlist_id
            AND setlists.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM setlists
            WHERE setlists.id = setlist_items.setlist_id
            AND setlists.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own setlist items"
    ON setlist_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM setlists
            WHERE setlists.id = setlist_items.setlist_id
            AND setlists.user_id = auth.uid()
        )
    );

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_favorites_updated_at
    BEFORE UPDATE ON favorites
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_setlists_updated_at
    BEFORE UPDATE ON setlists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
