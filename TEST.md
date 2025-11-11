# Testing the Chord Parsing Fix

## Test Cases

### 1. Trailing Slash Chords
**Input from Ultimate Guitar:**
```
[ch]A/[/ch] [ch]E/[/ch] [ch]F/aj7[/ch]
```

**Expected HTML Output:**
```html
<span class="chord fw-bold"><span class="chord-root">A</span></span>
<span class="chord fw-bold"><span class="chord-root">E</span></span>
<span class="chord fw-bold"><span class="chord-root">F</span><span class="chord-quality">maj7</span></span>
```

**Expected ChordPro Output:**
```
[A] [E] [Fmaj7]
```

### 2. Real Bass Notes (Should Not Be Affected)
**Input from Ultimate Guitar:**
```
[ch]C/G[/ch] [ch]Am/E[/ch] [ch]D/F#[/ch]
```

**Expected HTML Output:**
```html
<span class="chord fw-bold"><span class="chord-root">C</span>/<span class="chord-bass">G</span></span>
<span class="chord fw-bold"><span class="chord-root">A</span><span class="chord-quality">m</span>/<span class="chord-bass">E</span></span>
<span class="chord fw-bold"><span class="chord-root">D</span>/<span class="chord-bass">F#</span></span>
```

**Expected ChordPro Output:**
```
[C/G] [Am/E] [D/F#]
```

### 3. Section Markers
**Input:**
```
[Verse 1]
[ch]A/[/ch] Some lyrics
[Chorus]
[ch]D/[/ch] More lyrics
```

**Expected ChordPro Output:**
```
{comment: Verse 1}
[A] Some lyrics

{comment: Chorus}
[D] More lyrics
```

### 4. Complex Chords
**Input from Ultimate Guitar:**
```
[ch]Dsus4[/ch] [ch]A7sus4[/ch] [ch]Fmaj7[/ch] [ch]Em7[/ch]
```

**Expected HTML Output:**
```html
<span class="chord fw-bold"><span class="chord-root">D</span><span class="chord-quality">sus4</span></span>
<span class="chord fw-bold"><span class="chord-root">A</span><span class="chord-quality">7sus4</span></span>
<span class="chord fw-bold"><span class="chord-root">F</span><span class="chord-quality">maj7</span></span>
<span class="chord fw-bold"><span class="chord-root">E</span><span class="chord-quality">m7</span></span>
```

**Expected ChordPro Output:**
```
[Dsus4] [A7sus4] [Fmaj7] [Em7]
```

## How to Test

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Search for a song** with chords like `A/`, `E/`, etc.
   Example: "Schöpfer Aller Himmel" by Outbreakband

3. **Check HTML View:**
   - Chords should display cleanly without trailing slashes
   - No empty bass note indicators (no `A/` with nothing after)

4. **Check ChordPro View:**
   - Toggle to "ChordPro View"
   - Chords should show as `[A]`, `[E]`, etc. (no trailing slashes)
   - Section markers should be converted to `{comment: Section Name}`

5. **Export ChordPro:**
   - Click "📥 Export ChordPro"
   - Open the `.cho` file
   - Verify clean formatting with proper section markers

6. **Test Transpose:**
   - Use ↑/↓ to transpose
   - Verify chords update correctly in both views
   - Export and check transposed chords are correct

## Expected Results

✅ No trailing slashes in chord display
✅ Bass notes (C/G) still work correctly
✅ Section markers converted to ChordPro comments
✅ Clean, properly spaced ChordPro output
✅ Transpose works in both HTML and ChordPro views
✅ Export includes metadata and formatted content
