-- Supabase Database Schema for Freetar
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/_/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    artist_name TEXT NOT NULL,
    song_name TEXT NOT NULL,
    type TEXT NOT NULL,
    rating NUMERIC NOT NULL,
    tab_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, tab_url)
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

-- Setlist items table
CREATE TABLE IF NOT EXISTS setlist_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    setlist_id UUID REFERENCES setlists(id) ON DELETE CASCADE NOT NULL,
    artist_name TEXT NOT NULL,
    song_name TEXT NOT NULL,
    type TEXT NOT NULL,
    rating NUMERIC NOT NULL,
    tab_url TEXT NOT NULL,
    position INTEGER NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(setlist_id, tab_url)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS favorites_user_id_idx ON favorites(user_id);
CREATE INDEX IF NOT EXISTS favorites_created_at_idx ON favorites(created_at DESC);
CREATE INDEX IF NOT EXISTS setlists_user_id_idx ON setlists(user_id);
CREATE INDEX IF NOT EXISTS setlist_items_setlist_id_idx ON setlist_items(setlist_id);
CREATE INDEX IF NOT EXISTS setlist_items_position_idx ON setlist_items(setlist_id, position);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE setlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE setlist_items ENABLE ROW LEVEL SECURITY;

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
