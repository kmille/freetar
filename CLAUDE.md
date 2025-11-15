# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Freetar is an open-source alternative frontend to Ultimate Guitar that scrapes and displays guitar tabs and chords. This is a Next.js 14 implementation using the App Router, TypeScript, and React 18.

**Key Principles**:
- **Hybrid Storage**: Anonymous users use localStorage; authenticated users use Supabase cloud storage
- **Complete Tab Storage**: Full tab content (HTML, chords, metadata) is saved to database, not just references
- **No Re-scraping**: Favorited tabs and setlist items load instantly from database, no Ultimate Guitar dependency
- **Privacy-First**: Optional authentication via passwordless magic links (Supabase Auth)

## Development Commands

```bash
# Development
npm run dev              # Start dev server on localhost:3000

# Production
npm run build           # Build for production
npm start               # Start production server

# Code Quality
npm run lint            # Run ESLint
```

## Architecture Overview

### Data Flow Architecture

#### **Search Flow** (Always from Ultimate Guitar)
User → Search Page → `/api/search` → Ultimate Guitar → Cheerio Parser → Search Results Component

#### **Tab Viewing Flow** (Two paths)

**Path 1: From Search (Ultimate Guitar)**
1. User clicks search result → `/tab?path=artist/song/tab-123`
2. `/api/tab` scrapes Ultimate Guitar
3. Returns complete `SongDetail` object
4. TabDisplay renders the tab

**Path 2: From Favorites/Setlists (Database)**
1. User clicks favorite/setlist item → `/tab?id=<uuid>`
2. `/api/tab-by-id` fetches from Supabase `tabs` table
3. Returns complete `SongDetail` object (instant, no scraping!)
4. TabDisplay renders the tab

#### **Favorites Flow**

**Anonymous Users:**
- Stored in `localStorage` as `{ [tab_url]: { artist_name, song, type, rating, tab_url } }`
- Limited to browser only, no sync

**Authenticated Users:**
1. User favorites a tab → `addSupabaseFavorite(tab: SongDetail)`
2. Complete tab content saved to `tabs` table (or retrieves existing ID)
3. Reference created in `favorites` table: `{ user_id, tab_id }`
4. Home page fetches favorites via JOIN: `SELECT * FROM favorites JOIN tabs ON favorites.tab_id = tabs.id`
5. Returns full tab content, not just metadata

#### **Setlists Flow** (Authenticated only)
1. User creates setlist → Saved to `setlists` table
2. User adds tab to setlist → Complete tab saved to `tabs` table
3. Reference created in `setlist_items` table: `{ setlist_id, tab_id, position, notes }`
4. Setlist detail page fetches via JOIN: `SELECT * FROM setlist_items JOIN tabs ON setlist_items.tab_id = tabs.id`
5. All tabs load instantly from database

### Web Scraping Strategy

**Critical**: The app scrapes Ultimate Guitar by:
- Fetching HTML pages from `ultimate-guitar.com` and `tabs.ultimate-guitar.com`
- Extracting JSON data from `<div class="js-store" data-content="...">` elements
- Using a Chrome User-Agent header to avoid blocking
- Filtering out "Pro" and "Official" tab types (paid content)

**Location**: All scraping logic is in `src/lib/ug.ts`:
- `searchTabs()`: Searches for tabs by term and page number
- `getTab()`: Fetches a specific tab by URL path
- `fixTab()`: Converts tab markup (`[ch]`, `[tab]`) to HTML
- `getChords()`: Parses chord fingering data (applicature) into visual diagrams

### Supabase Integration Architecture

**Database Schema** (`supabase-schema.sql`):

1. **`tabs` table** - Stores complete tab content
   - `id` (UUID, primary key)
   - `tab_url` (TEXT, unique) - Original Ultimate Guitar URL
   - `artist_name`, `song_name`, `type` - Metadata
   - `version`, `votes`, `rating` - Stats (optional, default values)
   - `difficulty`, `tuning`, `capo` - Play info (optional)
   - `tab_content` (TEXT) - Full HTML content
   - `chords`, `fingers_for_strings`, `alternatives` (JSONB) - Structured data

2. **`favorites` table** - User favorites
   - `id` (UUID)
   - `user_id` (UUID, references auth.users)
   - `tab_id` (UUID, references tabs)
   - Unique constraint on `(user_id, tab_id)`

3. **`setlists` table** - Named collections
   - `id` (UUID)
   - `user_id` (UUID)
   - `name`, `description` - Setlist info

4. **`setlist_items` table** - Tabs in setlists
   - `id` (UUID)
   - `setlist_id` (UUID, references setlists)
   - `tab_id` (UUID, references tabs)
   - `position` (INTEGER) - Order in setlist
   - `notes` (TEXT) - Optional notes for this tab
   - Unique constraint on `(setlist_id, tab_id)`

**Row Level Security (RLS)**:
- `tabs`: Readable by all, writable by authenticated users
- `favorites`: Users can only access their own
- `setlists`: Users can only access their own
- `setlist_items`: Users can only access items in their own setlists

**Tab Storage Service** (`src/lib/tabs.ts`):
- `saveTab(tab: SongDetail)`: Saves complete tab to database (or returns existing ID)
- `getTabById(id: string)`: Retrieves full tab from database
- `getTabByUrl(url: string)`: Finds tab by original URL
- `songDetailToDbFormat()`: Converts SongDetail to database format
- `dbFormatToSongDetail()`: Converts database row to SongDetail

**Favorites Service** (`src/lib/favorites.ts`):
- `getSupabaseFavorites()`: Fetches user favorites with full tab content (JOIN query)
- `addSupabaseFavorite(tab: SongDetail)`: Saves tab and creates favorite reference
- `removeSupabaseFavorite(tabId: string)`: Removes favorite reference
- `isFavorited(tabId: string)`: Checks if tab is favorited
- Legacy localStorage support for anonymous users

**Setlists Service** (`src/lib/setlists.ts`):
- `getSetlists()`: Fetches user's setlists
- `getSetlist(id)`: Fetches setlist with full tab content (JOIN query)
- `createSetlist(name, description)`: Creates new setlist
- `addToSetlist(setlistId, tab: SongDetail)`: Saves tab and adds to setlist
- `removeFromSetlist(itemId)`: Removes tab from setlist
- `reorderSetlistItems()`: Changes tab order in setlist

**Authentication** (`src/contexts/AuthContext.tsx`):
- Uses Supabase Auth with magic link (passwordless email)
- `signInWithEmail(email)`: Sends magic link
- `signOut()`: Signs user out
- Auto-refresh tokens
- Persistent sessions
- Auth state available via `useAuth()` hook

**Critical Implementation Details**:
1. When a tab is favorited or added to setlist, **complete content is saved** to `tabs` table
2. The `tabs` table acts as a shared cache - same tab can be in multiple favorites/setlists
3. `tab_url` is unique, so duplicate tabs aren't stored
4. All reads from database use JOINs to fetch complete tab content
5. URLs to database tabs use `?id=<uuid>` instead of `?path=<path>`

### Client-Side State Architecture

**Favorites System** (Hybrid):
- **Anonymous users**: localStorage `{ [tabUrl]: { artist_name, song, type, rating, tab_url } }`
- **Authenticated users**: Supabase database with full tab content
- Managed by `useFavorites()` hook
- Auto-detects user state and uses appropriate storage

**Transpose System**:
- Uses 12-tone equal temperament: `['A'], ['A#', 'Bb'], ['B', 'Cb'], ...`
- Transposes by finding note index and shifting modulo 12
- Applied client-side by parsing and modifying DOM elements with `.chord-root` and `.chord-bass` classes
- Original chord values stored in component state for reset functionality

**Auto-scroll System**:
- Uses `setInterval` with configurable timeout (50-500ms)
- Pauses automatically on user wheel/touch events
- Speed control adjusts interval timeout

**Font Size System**:
- Adjustable font size for tab content (lyrics and chords)
- Range: 10px to 24px in 2px increments
- Default: 14px
- Applied via inline style to tab content div
- Reset button to return to default size

**Capo System** (`TabDisplay.tsx`):
- Virtual capo control (0-12 frets)
- Transposes chords DOWN to show shapes to play with capo
- Works in combination with transpose control
- Displays both original capo (from tab metadata) and virtual capo
- Shows effective transpose value (transpose - capo)

### Component Architecture

**Page Components** (`src/app/`):
- `page.tsx`: Home page showing favorites (localStorage for guests, Supabase for logged-in users)
- `search/page.tsx`: Search results from Ultimate Guitar
- `tab/page.tsx`: Displays tab from either Ultimate Guitar (`?path=`) or database (`?id=`)
- `about/page.tsx`: Static about page
- `setlists/page.tsx`: Lists user's setlists (authenticated only)
- `setlists/[id]/page.tsx`: Shows setlist with tabs from database (authenticated only)
- `auth/callback/route.ts`: Handles magic link authentication callback

**Reusable Components** (`src/components/`):
- `Navbar.tsx`: Search form + authentication UI (sign in button, user dropdown with setlists link)
- `SearchResults.tsx`: Table with sorting, pagination, and favorite toggles
- `TabDisplay.tsx`: Main tab viewer with transpose, capo, autoscroll, chord visibility, font size controls
  - "Add to Setlist" button (visible when logged in)
  - Favorites button (saves full content to database if logged in)
- `ChordDiagram.tsx`: Renders chord fingering diagrams from applicature data
- `AuthModal.tsx`: Magic link login modal

**Hooks** (`src/hooks/`):
- `useFavorites()`: Manages favorites (localStorage for guests, Supabase for authenticated)
  - Returns: `{ favorites, localFavorites, loading, toggleFavorite, isFavorite, getTabId }`
  - Auto-detects user auth state
  - Handles full tab content storage

**Contexts** (`src/contexts/`):
- `AuthContext.tsx`: Provides authentication state throughout app
  - `useAuth()` hook returns `{ user, session, loading, signInWithEmail, signOut, isConfigured }`

### Type System

**Application Types** (`src/types/index.ts`):
- `SearchResult`: Individual search result metadata
- `SongDetail`: Complete tab with content, metadata, chords, and fingerings
- `ChordVariant`: Map of fret numbers to string press patterns `{ [fret]: [0|1, 0|1, ...] }`
- `SearchResponse`: Paginated search results
- `FreetarError`: Custom error class for user-facing error messages

**Database Types** (`src/types/database.ts`):
- Auto-generated from Supabase schema
- `Database.public.Tables.tabs` - Tabs table types (Row, Insert, Update)
- `Database.public.Tables.favorites` - Favorites table types
- `Database.public.Tables.setlists` - Setlists table types
- `Database.public.Tables.setlist_items` - Setlist items table types
- Can be regenerated with `supabase gen types typescript --linked`

**Service Types** (`src/lib/*.ts`):
- `FavoriteWithTab`: Favorite with complete tab content (JOIN result)
- `SetlistWithItems`: Setlist with complete tab items (JOIN result)
- `SetlistItemWithTab`: Setlist item with complete tab content

### Dark Mode Implementation

Dark mode uses DaisyUI's `data-theme` attribute:
- Initial theme detection in `<script>` tag in `layout.tsx` (runs before hydration)
- Checks localStorage first, falls back to system preference
- Toggle updates both DOM attribute and localStorage
- Prevents flash of wrong theme on page load
- DaisyUI provides 'light' and 'dark' theme variants

### Progressive Web App (PWA) Implementation

Freetar is a fully-featured Progressive Web App that can be installed on mobile and desktop devices:

**PWA Configuration** (`next.config.js`):
- Uses `next-pwa` package wrapped around Next.js config
- Service worker destination: `public/` directory
- Auto-registers service worker for offline functionality
- Disabled in development mode for easier debugging
- Generates `sw.js` and workbox files automatically during build

**Web App Manifest** (`public/manifest.json`):
- App name: "Freetar - Free Guitar Tabs"
- Display mode: `standalone` (runs without browser UI)
- Theme colors: White background, dark gray theme (#1f2937)
- Icons: 8 sizes from 72x72 to 512x512 pixels
- Supports both `any` and `maskable` purposes for adaptive icons

**Metadata Configuration** (`src/app/layout.tsx`):
- Viewport export: Proper mobile viewport and theme color
- Manifest link: Points to `/manifest.json`
- Apple Web App support: Enabled with custom status bar styling
- Icons metadata: Standard icons (192x192, 512x512) and Apple touch icon (152x152)
- All PWA metadata separated from general metadata per Next.js 14 requirements

**PWA Icons**:
- Generated from `public/guitar.png` source image
- 8 sizes: 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
- Format: PNG with transparent backgrounds
- Generation script: Icons can be regenerated using `sharp` package

**PWA Features**:
- Install to home screen on mobile/desktop
- Offline support with service worker caching
- Fast loading with cached resources
- Standalone app experience without browser chrome
- Automatic updates when new service worker is available

**Generated Files** (excluded from git):
- `/public/sw.js`: Main service worker file
- `/public/sw.js.map`: Source map for debugging
- `/public/workbox-*.js`: Workbox runtime files for caching strategies
- All generated during `npm run build` and excluded via `.gitignore`

## Key Implementation Details

### Chord Diagram Calculation

The `getChords()` function in `src/lib/ug.ts` converts Ultimate Guitar's "applicature" data:
1. Takes array of fret positions for each string (6 strings)
2. Calculates min/max fret range
3. Creates 6-fret visualization window showing pressed strings
4. Maps finger positions (1-4, T for thumb, x for unstrummed)
5. Returns both visual grid and fingering labels

### Tab Content Parsing

Tab content arrives with markup tags:
- `[ch]C#m[/ch]` → chord markup
- `[tab]...[/tab]` → tab content wrapper
- Regex extracts chord root, quality (m, 7, maj7, etc.), and bass note
- Converted to HTML spans: `<span class="chord"><span class="chord-root">C#</span><span class="chord-quality">m</span></span>`
- Whitespace converted to `&nbsp;` to preserve formatting in HTML

**Important**: Ultimate Guitar sometimes includes trailing slashes in chord notation (e.g., `A/`, `E/`). These are NOT bass notes but formatting artifacts. The regex pattern `[^\[/]+` excludes slashes from chord quality, and trailing slashes are explicitly removed with `.replace(/\/+$/, '')`. Only treat `/X` as a bass note if there's a note letter after the slash.

### URL Routing Pattern

**From Search Results (Ultimate Guitar)**:
- Original URL format: `https://tabs.ultimate-guitar.com/tab/artist-name/song-name/tab-123456`
- `SearchResult.tab_url` stores the pathname: `/tab/artist-name/song-name/tab-123456`
- Next.js route: `/tab?path=artist-name/song-name/tab-123456`
- API route: `/api/tab?path=...` scrapes Ultimate Guitar

**From Favorites/Setlists (Database)**:
- Database stores complete tab with UUID primary key
- Next.js route: `/tab?id=<uuid>`
- API route: `/api/tab-by-id?id=<uuid>` fetches from Supabase
- Instant load, no scraping required

**Route Handler Logic** (`src/app/tab/page.tsx`):
- Checks for `id` param first → fetch from database
- Falls back to `path` param → fetch from Ultimate Guitar
- Both return same `SongDetail` type → TabDisplay works identically

### Tailwind CSS and DaisyUI Integration

The app uses Tailwind CSS with DaisyUI component library:
- Tailwind CSS provides utility-first styling
- DaisyUI adds pre-built components (buttons, cards, tables, etc.)
- Configuration in `tailwind.config.js` and `postcss.config.js`
- Global styles and Tailwind directives in `src/app/globals.css`
- DaisyUI themes configured for light/dark mode switching

## ChordPro Format Support

The app supports conversion to/from ChordPro format (https://songbook-pro.com/docs/manual/chordpro/):

**ChordPro Library** (`src/lib/chordpro.ts`):
- `convertToChordPro()`: Converts SongDetail to ChordPro text with metadata directives
- `chordProToHtml()`: Converts ChordPro text to displayable HTML
- `parseChordPro()`: Parses ChordPro text into structured data
- `exportChordProFile()`: Downloads tab as .cho file

**Format**:
- Metadata: `{title: Song Name}`, `{artist: Artist Name}`, `{capo: 3}`, etc.
- Chords: `[Am]`, `[G7/B]` (inline with lyrics)
- Comments: `{comment: Difficulty: Easy}`
- Transpose value preserved in export

**View Modes**:
- HTML View: Original Ultimate Guitar format with styled chords
- ChordPro View: Converts to ChordPro format for display (chords in brackets)

## Common Modifications

### Adding New Tab Features

When adding features to tab display:
1. Add UI controls in `TabDisplay.tsx`
2. Use React state for feature toggle/values
3. Apply transformations in `getTransposedTab()` or similar utility
4. Ensure print-friendly by adding `no-print` class to controls

### Modifying Search/Filter Logic

Search filtering happens in `src/lib/ug.ts`:
- `getResults()` filters by tab type (excludes "Pro" and "Official")
- To add more filters, modify this function before returning results
- Filtering can also happen client-side in `SearchResults.tsx`

### Changing Scraping Selectors

If Ultimate Guitar changes their HTML structure:
- Update selectors in `searchTabs()` and `getTab()` in `src/lib/ug.ts`
- Look for `div.js-store` with `data-content` attribute
- JSON structure is nested: `data.store.page.data.{results|tab|tab_view}`
- Test with actual Ultimate Guitar pages to verify structure

## Environment & Dependencies

**Required Environment Variables for Supabase Features**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from: Supabase Dashboard → Settings → API

**Optional Environment Variables**:
- `NEXT_PUBLIC_BASE_URL`: Sets the base URL for metadata and Open Graph images (defaults to `https://freetar.de`)

**Without Supabase configured**:
- App works fully for anonymous users (search, view tabs, localStorage favorites)
- Authentication UI hidden in navbar
- Setlists feature disabled

**With Supabase configured**:
- Authentication enabled (magic link sign-in)
- Cloud-synced favorites
- Setlists feature enabled
- Complete tab storage in database

**Critical Dependencies**:
- `@supabase/supabase-js`: Supabase client for authentication and database
- `cheerio`: Server-side HTML parsing (like jQuery for Node.js)
- `axios`: HTTP client with better error handling than fetch
- `tailwindcss` + `daisyui`: Utility-first CSS framework with component library (note: custom CSS in globals.css for chord styling)
- `next-pwa`: Progressive Web App support with service worker generation (note: peer dependency warnings for webpack/@babel/core are expected and can be ignored as Next.js provides these internally)

**Development Dependencies**:
- `sharp`: Image processing library for generating PWA icons in multiple sizes

**Node Version**: Requires Node.js ≥22.0.0 (specified in package.json engines)

**Supabase Setup**:
1. Create account at https://supabase.com
2. Create new project
3. Run `supabase-schema.sql` in SQL Editor
4. Get credentials from Settings → API
5. Add to `.env.local`
6. See `SUPABASE_SETUP.md` for detailed instructions

## Deployment Considerations

**Vercel Deployment**:
- Uses Next.js serverless functions for API routes
- No additional configuration needed
- Ensure Node.js version matches engine requirement

**Docker Deployment**:
- Complete Docker setup with multi-stage builds (see `Dockerfile` and `docker-compose.yml`)
- Uses Node.js 22 Alpine images for minimal size
- Exposes port 3000 by default
- Run with `docker-compose up -d`
- See `DOCKER.md` for detailed deployment instructions
- Optional: Set `NEXT_PUBLIC_BASE_URL` environment variable for custom domains

**CORS**: Not an issue because scraping happens server-side in API routes, not from browser.

## Privacy & Legal

- **No tracking or analytics**: Zero user tracking, no third-party scripts
- **Optional authentication**: Users can use the app anonymously
- **Data storage**:
  - Anonymous users: localStorage only (client-side)
  - Authenticated users: Supabase (cloud database) - user controls their data
- **Scraper proxy**: Acts as a proxy/scraper for Ultimate Guitar content
- **User responsibility**: Users should be aware this scrapes a third-party site
- **Not affiliated**: Not affiliated with or endorsed by Ultimate Guitar

## Common Issues & Troubleshooting

### **Supabase Integration Issues**

**Problem**: "Songs not saved to database" or "Error inserting tab"
- **Solution**: See `TROUBLESHOOTING.md` for complete debugging guide
- Common causes:
  - Database schema not run or incomplete
  - Missing/incorrect `.env.local` credentials
  - RLS policies too restrictive
  - `tabs` table missing default values for `votes`, `version`, `rating`

**Problem**: "Row-level security policy" errors
- **Solution**: Re-run `supabase-schema.sql` completely
- Make sure RLS policies allow authenticated users to insert into `tabs` table

**Problem**: Favorites work but setlists don't save songs
- **Solution**: Check browser console for specific error
- Verify `tab_content` is not null in the tab data
- Ensure all required fields have values or defaults

### **Ultimate Guitar Scraping Issues**

To test if scraping still works after UG updates:
1. Try searching for a common song (e.g., "Wonderwall")
2. Check browser devtools network tab for API route responses
3. If errors occur, inspect actual UG HTML structure
4. Update selectors in `src/lib/ug.ts` as needed
5. Look for `div.js-store` and verify JSON structure in `data-content` attribute

## Related Documentation

- `SUPABASE_SETUP.md`: Complete Supabase setup guide with step-by-step instructions
- `TROUBLESHOOTING.md`: Detailed troubleshooting for database and authentication issues
- `DOCKER.md`: Docker deployment instructions
- `supabase-schema.sql`: Complete database schema with RLS policies
