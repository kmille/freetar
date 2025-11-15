# Stage View Feature

## Overview

The Stage View feature allows logged-in users to share their setlists in a performance-optimized view perfect for live gigs. Band members can access a clean, easy-to-navigate interface to display songs during performances.

## Key Features

- **Public Sharing**: Share setlists via a unique, secure link (no login required for viewers)
- **Clean Interface**: Minimal controls with focus on song content
- **Easy Navigation**: Multiple ways to move between songs:
  - Arrow keys (Left/Right) for keyboard navigation
  - Swipe gestures (Left/Right) for touch devices
  - Navigation buttons (Previous/Next)
  - Song list overlay (press L or click list button)
- **Performance Info**: Displays capo, tuning, difficulty, and custom notes
- **Touch-Friendly**: Optimized for tablets and phones used on stage

## Setup Instructions

### 1. Database Migration

Run the migration SQL in your Supabase SQL Editor:

```bash
# File: supabase-migration-stage-view.sql
```

This adds:
- `share_token` column to setlists table
- RLS policies for public access to shared setlists
- Function to generate random share tokens

### 2. Usage Flow

#### For Setlist Owners:

1. **Create a setlist** with songs
2. **Enable sharing**:
   - Go to your setlist detail page
   - Click "Enable Stage View Sharing"
   - A unique share token is generated
3. **Share the link**:
   - Click "Copy Link" to copy the stage view URL
   - Share with band members via email, text, etc.
   - Click "Open Stage View" to preview
4. **Manage sharing**:
   - Disable sharing anytime to revoke access
   - Re-enabling generates a new link

#### For Performers:

1. **Open the shared link** on your device
2. **Navigate songs**:
   - Use arrow keys (desktop/laptop)
   - Swipe left/right (mobile/tablet)
   - Click Previous/Next buttons
   - Press L or click list icon to see all songs
3. **View song details**:
   - Full tab content with chords and lyrics
   - Capo, tuning, and difficulty information
   - Custom notes added by setlist owner

## Keyboard Shortcuts

- `←` (Left Arrow): Previous song
- `→` (Right Arrow): Next song
- `L`: Toggle song list overlay
- `Esc`: Close song list overlay

## Touch Gestures

- **Swipe Left**: Next song
- **Swipe Right**: Previous song

## URL Structure

- **Setlist Detail** (owner): `/setlists/[setlist-id]`
- **Stage View** (public): `/stage/[share-token]`

## Security

- Share tokens are 16-character random strings
- Tokens can be disabled/regenerated at any time
- No authentication required for stage view (read-only access)
- Row Level Security (RLS) ensures users can only share their own setlists

## API Endpoints

### GET `/api/setlist-by-token`

Fetches a shared setlist by token (public access).

**Query Parameters:**
- `token` (string, required): The share token

**Response:**
```json
{
  "id": "uuid",
  "name": "My Setlist",
  "description": "Description",
  "share_token": "abc123...",
  "items": [
    {
      "id": "uuid",
      "position": 0,
      "notes": "Custom notes",
      "tab": {
        "song_name": "Song Name",
        "artist_name": "Artist",
        "tab": "HTML content",
        "capo": 2,
        "tuning": "Standard",
        ...
      }
    }
  ]
}
```

## Code Structure

### New Files

- `supabase-migration-stage-view.sql` - Database migration
- `src/app/api/setlist-by-token/route.ts` - API endpoint for public access
- `src/app/stage/[token]/page.tsx` - Stage view page component

### Modified Files

- `src/lib/setlists.ts`:
  - Added `share_token` to `Setlist` interface
  - Added `enableSharing()` function
  - Added `disableSharing()` function
  - Added `getSetlistByShareToken()` function

- `src/app/setlists/[id]/page.tsx`:
  - Added sharing UI (enable/disable buttons)
  - Added copy link functionality
  - Added "Open Stage View" button

## Future Enhancements (Optional)

- **Transpose controls** in stage view (currently only in regular tab view)
- **Auto-scroll** with speed control
- **Fullscreen mode** toggle
- **Font size adjustment** for better visibility on stage
- **Bluetooth foot pedal configuration** guide
- **QR code generation** for easy link sharing
- **Print-optimized view** for physical song sheets

## Troubleshooting

### "Setlist not found or not shared"
- Ensure the migration SQL was run successfully
- Check that sharing is enabled for the setlist
- Verify the share token in the URL is correct

### Swipe gestures not working
- Ensure you're swiping on the content area (not navigation buttons)
- Try increasing swipe distance (threshold is 50px)

### Songs not loading
- Check browser console for errors
- Verify RLS policies allow public access to shared setlists
- Ensure tabs table has full content stored

## Testing Checklist

- [ ] Run database migration
- [ ] Create a setlist with 3+ songs
- [ ] Enable sharing
- [ ] Copy and open stage view link in new browser/incognito window
- [ ] Test keyboard navigation (arrow keys)
- [ ] Test touch gestures (on mobile/tablet)
- [ ] Test song list overlay (L key / list button)
- [ ] Verify all song content displays correctly
- [ ] Test disabling sharing (link should stop working)
- [ ] Re-enable sharing (new link should work)
