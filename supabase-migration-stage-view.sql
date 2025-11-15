-- Migration: Add stage view sharing support to setlists
-- Run this in your Supabase SQL Editor after running the main schema

-- Add share_token column to setlists table
ALTER TABLE setlists ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE;

-- Create index for fast lookup by share_token
CREATE INDEX IF NOT EXISTS setlists_share_token_idx ON setlists(share_token) WHERE share_token IS NOT NULL;

-- Add RLS policy to allow public access to shared setlists
CREATE POLICY "Anyone can view shared setlists"
    ON setlists FOR SELECT
    USING (share_token IS NOT NULL);

-- Add RLS policy to allow public access to items in shared setlists
CREATE POLICY "Anyone can view items in shared setlists"
    ON setlist_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM setlists
            WHERE setlists.id = setlist_items.setlist_id
            AND setlists.share_token IS NOT NULL
        )
    );

-- Function to generate a random share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..16 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;
