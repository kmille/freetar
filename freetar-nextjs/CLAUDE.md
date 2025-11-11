# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Freetar is an open-source alternative frontend to Ultimate Guitar that scrapes and displays guitar tabs and chords. This is a Next.js 14 implementation using the App Router, TypeScript, and React 18.

**Key Principle**: All user data (favorites, preferences) is stored client-side in localStorage. The application proxies requests to Ultimate Guitar through Next.js API routes to avoid CORS issues.

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

1. **Search Flow**: User → Search Page → `/api/search` → Ultimate Guitar → Cheerio Parser → Search Results Component
2. **Tab Flow**: User → Tab Page → `/api/tab` → Ultimate Guitar → Tab Parser → Tab Display Component
3. **Favorites**: Stored entirely in browser localStorage, no server-side persistence

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

### Client-Side State Architecture

**Favorites System**:
- Storage format: `{ [tabUrl]: { artist_name, song, type, rating, tab_url } }`
- Managed independently in each component that displays favorites
- Export/import uses JSON serialization

**Transpose System**:
- Uses 12-tone equal temperament: `['A'], ['A#', 'Bb'], ['B', 'Cb'], ...`
- Transposes by finding note index and shifting modulo 12
- Applied client-side by parsing and modifying DOM elements with `.chord-root` and `.chord-bass` classes
- Original chord values stored in component state for reset functionality

**Auto-scroll System**:
- Uses `setInterval` with configurable timeout (50-500ms)
- Pauses automatically on user wheel/touch events
- Speed control adjusts interval timeout

### Component Architecture

**Page Components** (`src/app/`):
- `page.tsx`: Home page showing favorites from localStorage
- `search/page.tsx`: Client component that fetches search results via `/api/search`
- `tab/page.tsx`: Client component that fetches tab data via `/api/tab`
- `about/page.tsx`: Static about page

**Reusable Components** (`src/components/`):
- `Navbar.tsx`: Contains search form with client-side routing
- `SearchResults.tsx`: Table with sorting, pagination, and favorite toggles
- `TabDisplay.tsx`: Main tab viewer with transpose, autoscroll, chord visibility controls
- `ChordDiagram.tsx`: Renders chord fingering diagrams from applicature data
- `BootstrapClient.tsx`: Loads Bootstrap JS on client-side only

### Type System

All types in `src/types/index.ts`:
- `SearchResult`: Individual search result metadata
- `SongDetail`: Complete tab with content, metadata, chords, and fingerings
- `ChordVariant`: Map of fret numbers to string press patterns `{ [fret]: [0|1, 0|1, ...] }`
- `SearchResponse`: Paginated search results
- `FreetarError`: Custom error class for user-facing error messages

### Dark Mode Implementation

Dark mode uses Bootstrap's `data-bs-theme` attribute:
- Initial theme detection in `<script>` tag in `layout.tsx` (runs before hydration)
- Checks localStorage first, falls back to system preference
- Toggle updates both DOM attribute and localStorage
- Prevents flash of wrong theme on page load

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

Tab URLs from Ultimate Guitar use format: `/tab/artist-name/song-name/tab-123456`
- `SearchResult.tab_url` stores the pathname only (not full URL)
- Next.js route: `/tab?path=artist-name/song-name/tab-123456`
- API route extracts path param and fetches from `https://tabs.ultimate-guitar.com/tab/${path}`

### Bootstrap Integration

Bootstrap CSS is imported in `layout.tsx`, but Bootstrap JS needs client-side loading:
- `BootstrapClient.tsx` uses `useEffect` to require Bootstrap JS
- This prevents SSR issues with Bootstrap's DOM manipulation
- Component returns null (only used for side effect)

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
4. Ensure print-friendly by adding `d-print-none` class to controls

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

**No environment variables required** for basic functionality.

**Critical Dependencies**:
- `cheerio`: Server-side HTML parsing (like jQuery for Node.js)
- `axios`: HTTP client with better error handling than fetch
- `bootstrap` + `react-bootstrap`: UI framework (note: custom CSS in globals.css for chord styling)

**Node Version**: Requires Node.js ≥18.0.0 (specified in package.json engines)

## Deployment Considerations

**Vercel Deployment**:
- Uses Next.js serverless functions for API routes
- No additional configuration needed
- Ensure Node.js version matches engine requirement

**Docker Deployment**:
- Need to expose port 3000
- Set NODE_ENV=production
- Run `npm run build` before `npm start`

**CORS**: Not an issue because scraping happens server-side in API routes, not from browser.

## Privacy & Legal

- No user tracking or analytics
- No server-side data storage
- Acts as a proxy/scraper for Ultimate Guitar content
- Users should be aware this scrapes a third-party site
- Not affiliated with Ultimate Guitar

## Testing Ultimate Guitar Scraping

To test if scraping still works after UG updates:
1. Try searching for a common song (e.g., "Wonderwall")
2. Check browser devtools network tab for API route responses
3. If errors occur, inspect actual UG HTML structure
4. Update selectors in `src/lib/ug.ts` as needed
5. Look for `div.js-store` and verify JSON structure in `data-content` attribute
