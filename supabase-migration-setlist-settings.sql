-- Migration: Add transpose and capo settings to setlist items
-- Run this in your Supabase SQL Editor after the stage view migration

-- Add transpose and capo columns to setlist_items table
-- These store the user's preferred settings for each song in the setlist
ALTER TABLE setlist_items ADD COLUMN IF NOT EXISTS transpose INTEGER DEFAULT 0;
ALTER TABLE setlist_items ADD COLUMN IF NOT EXISTS capo INTEGER DEFAULT 0;

-- Add comment to explain the columns
COMMENT ON COLUMN setlist_items.transpose IS 'Transpose value to apply when displaying this song (-12 to +12)';
COMMENT ON COLUMN setlist_items.capo IS 'Virtual capo position to apply when displaying this song (0 to 12)';
