# ChordPro Format Support

Freetar now supports ChordPro format for displaying and exporting guitar tabs.

## What is ChordPro?

ChordPro is a simple text-based format for writing songs with chords. It uses:
- Square brackets `[Chord]` for chords placed inline with lyrics
- Curly braces `{directive: value}` for metadata and formatting
- Plain text for lyrics and tab content

Learn more: https://songbook-pro.com/docs/manual/chordpro/

## Features

### 1. View Modes

Toggle between two display modes:

**HTML View** (Default)
- Original Ultimate Guitar format
- Styled chord display with color highlighting
- Separated chord root, quality, and bass notes

**ChordPro View**
- Displays chords in standard `[Chord]` notation
- Compatible with ChordPro software
- Cleaner, text-based format

### 2. Export ChordPro

Click "📥 Export ChordPro" to download the current tab as a `.cho` file.

The exported file includes:
- Metadata: title, artist, capo, tuning, difficulty, rating
- Current transpose value (if applied)
- Full tab content in ChordPro format

Example:
```
{title: Wonderwall}
{artist: Oasis}
{capo: 2}
{meta: difficulty Easy}
{meta: transposed +2 semitones}

{start_of_verse}
[Em7]Today is [G]gonna be the day
That they're [Dsus4]gonna throw it back to [A7sus4]you
[Em7]By now you [G]should've somehow
Re[Dsus4]alized what you gotta [A7sus4]do
{end_of_verse}
```

### 3. Copy to Clipboard

Click "📋 Copy ChordPro" to copy the ChordPro format to your clipboard.

Use this to:
- Paste into ChordPro software (SongbookPro, ChordPro, OnSong, etc.)
- Share with other musicians
- Store in text files or notes apps

### 4. Transpose with ChordPro

Transpose controls work seamlessly in both view modes:
- Use ↑ / ↓ to transpose up or down
- Transposed chords are updated in real-time
- Export includes the transpose value in metadata
- Original chord relationships preserved

## File Format

### Metadata Directives

```
{title: Song Name}          - Song title
{artist: Artist Name}       - Artist name
{capo: 3}                  - Capo position
{meta: key value}          - Custom metadata (tuning, difficulty, etc.)
```

### Section Directives

```
{start_of_verse}           - Begin verse section
{end_of_verse}             - End verse section
{start_of_chorus}          - Begin chorus section
{end_of_chorus}            - End chorus section
{start_of_bridge}          - Begin bridge section
{end_of_bridge}            - End bridge section
{comment: text}            - Comments or unnamed sections
```

### Chord Notation

```
[C]          - Simple major chord
[Cm]         - Minor chord
[C7]         - 7th chord
[Cmaj7]      - Major 7th chord
[C/G]        - Chord with bass note
[C#m7/G#]    - Complex chord with bass
```

### Content

Chords are placed inline with lyrics at the exact position they should be played:

```
{start_of_verse}
[C]Today is gonna be the [G]day
That they're gonna [Am]throw it back to [F]you
{end_of_verse}
```

## Use Cases

### For Musicians

- **Practice**: Use autoscroll and transpose to practice in your comfortable range
- **Export**: Save tabs to your device for offline use
- **Share**: Copy ChordPro format to share with bandmates
- **Import**: Paste into ChordPro apps on your phone/tablet

### For Developers

- **Integration**: ChordPro is a widely-supported format
- **Processing**: Easy to parse and manipulate programmatically
- **Storage**: Plain text format, version control friendly
- **Compatibility**: Works with many chord/tab applications

## API Usage

If you want to use the ChordPro utilities in your own code:

```typescript
import { convertToChordPro, parseChordPro, chordProToHtml, exportChordProFile } from '@/lib/chordpro';

// Convert tab to ChordPro text
const chordProText = convertToChordPro(songDetail, transposeValue);

// Parse ChordPro text
const parsed = parseChordPro(chordProText);
console.log(parsed.metadata); // { title: "Song", artist: "Artist", ... }
console.log(parsed.chords);   // ["C", "G", "Am", "F"]

// Convert ChordPro to HTML for display
const html = chordProToHtml(chordProText);

// Export as file
exportChordProFile(songDetail, transposeValue);
```

## Compatibility

ChordPro format is supported by many apps:

- **Desktop**: ChordPro, SongbookPro, Guitar Pro
- **Mobile**: OnSong (iOS), SongBook (Android), Chordify
- **Web**: Many online chord editors and viewers
- **Text Editors**: Any plain text editor (VS Code, Notepad++, etc.)

## Tips

1. **Transpose First**: Set your preferred transpose value before exporting
2. **Backup Favorites**: Export your favorite tabs to .cho files for safekeeping
3. **Print-Friendly**: ChordPro view is excellent for printing without extra UI
4. **Batch Export**: Open multiple tabs and export each to build a songbook
5. **Edit After Export**: .cho files are plain text - edit them in any text editor

## Limitations

- Chord diagrams are not included in ChordPro export (text format only)
- Some complex formatting from Ultimate Guitar may be simplified
- Tablature sections are included as plain text
- Performance notes in brackets are preserved as-is

## Future Enhancements

Potential improvements:
- Import .cho files directly
- Bulk export multiple tabs
- Custom ChordPro directive support
- Chord diagram notation in comments
- Section markers (verse, chorus, bridge)
