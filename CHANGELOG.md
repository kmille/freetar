# Changelog

## [Unreleased]

### Added
- **ChordPro Section Directives**: Proper `{start_of_verse}`, `{end_of_verse}`, `{start_of_chorus}`, `{end_of_chorus}`, and `{start_of_bridge}` directives
- **ChordPro Metadata**: Changed from `{comment:}` to `{meta:}` for better standard compliance
- **Section Detection**: Automatically detects `[Verse 1]`, `[Chorus]`, `[Bridge]` markers and wraps content in proper directives

### Fixed
- **Chord Parsing**: Fixed issue with trailing slashes in chord notation (e.g., `A/`, `E/`, `F/`)
  - Previously: `A/` was parsed as `A` with an empty bass note, displaying incorrectly as `A/`
  - Now: Trailing slashes are properly removed from chord quality, displaying as `A`
  - Affected chords: Any chord ending with `/` without a bass note following

### Improved
- **ChordPro Conversion**: Complete rewrite for standard compliance
  - Wraps verses in `{start_of_verse}...{end_of_verse}`
  - Wraps choruses in `{start_of_chorus}...{end_of_chorus}`
  - Wraps bridges in `{start_of_bridge}...{end_of_bridge}`
  - Supports: Verse, Chorus, Bridge, Intro, Outro sections
  - Maps Intro and Outro to verse directives (ChordPro standard)
  - Other sections use `{comment:}` directive

- **ChordPro Output**: Clean, standard-compliant formatting
  - **Fixed `<0xa0>` issue**: Properly converts `&nbsp;` to regular spaces
  - Removes trailing spaces from all lines
  - Cleans up extra slashes from chord quality strings
  - Chords placed inline with lyrics (proper ChordPro format)
  - Empty lines between sections for readability
  - No encoding artifacts in output

## Technical Details

### Chord Regex Update
Changed from:
```javascript
const chordRegex = /\[ch\](?<root>[A-Ha-h](#|b)?)(?<quality>[^\[\/]+)?(?<bass>\/[A-Ha-h](#|b)?)?\[\/ch\]/g;
```

To:
```javascript
const chordRegex = /\[ch\]([A-Ha-h](#|b)?)([^\[/]+)?(\/[A-Ha-h](#|b)?)?\[\/ch\]/g;
```

Key changes:
- Changed `[^\[\/]+` to `[^\[/]+` - Excludes forward slash from chord quality
- Added explicit removal of trailing slashes: `cleanQuality.replace(/\/+$/, '')`
- Only treat `/X` as bass note if there's actually a note after the slash

### Section Marker Detection
Added regex pattern:
```javascript
/^\s*\[(Verse|Chorus|Bridge|Intro|Outro|Pre-Chorus|Interlude|Solo|End)(\s+\d+)?\]\s*$/i
```

Converts:
- `[Verse 1]` → `{comment: Verse 1}`
- `[Chorus]` → `{comment: Chorus}`
- `[Bridge]` → `{comment: Bridge}`

## Example

### Issue 1: Trailing Slashes

**Before (incorrect):**
```html
<span class="chord"><span class="chord-root">A</span>/<span class="chord-bass"></span></span>
```

**After (correct):**
```html
<span class="chord"><span class="chord-root">A</span></span>
```

### Issue 2: ChordPro Format

**Before (incorrect):**
```
{title: Song}
{comment: Verse 1}
[Am]<0xa0><0xa0><0xa0>[G]<0xa0><0xa0>Text<0xa0>here
```

**After (correct):**
```
{title: Song}
{artist: Artist}
{meta: difficulty Easy}

{start_of_verse}
[Am]   [G]  Text here
{end_of_verse}

{start_of_chorus}
[C]Lyrics [G]with [Am]chords [F]inline
{end_of_chorus}
```

## Files Modified
- `src/lib/ug.ts` - Updated `fixTab()` function for better chord parsing
- `src/lib/chordpro.ts` - Enhanced `htmlToChordPro()` for section markers and spacing
