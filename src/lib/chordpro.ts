import { SongDetail } from '@/types';

/**
 * Converts a SongDetail object to ChordPro format
 * ChordPro format: https://www.chordpro.org/chordpro/
 */
export function convertToChordPro(tab: SongDetail, transposeValue: number = 0): string {
  const lines: string[] = [];

  // Metadata directives
  lines.push(`{title: ${tab.song_name}}`);
  lines.push(`{artist: ${tab.artist_name}}`);

  if (tab.capo) {
    lines.push(`{capo: ${tab.capo}}`);
  }

  if (tab.tuning) {
    lines.push(`{meta: tuning ${tab.tuning}}`);
  }

  lines.push(`{meta: difficulty ${tab.difficulty}}`);
  lines.push(`{meta: version ${tab.version}}`);
  lines.push(`{meta: rating ${tab.rating}/5}`);

  if (transposeValue !== 0) {
    lines.push(`{meta: transposed ${transposeValue > 0 ? '+' : ''}${transposeValue} semitones}`);
  }

  lines.push(''); // Empty line after metadata

  // Convert tab content to ChordPro format
  const chordProContent = htmlToChordPro(tab.tab, transposeValue);
  lines.push(chordProContent);

  return lines.join('\n');
}

/**
 * Converts HTML formatted tab to ChordPro format
 * Extracts chords from HTML spans and converts to [Chord] notation inline with lyrics
 */
function htmlToChordPro(html: string, transposeValue: number = 0): string {
  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  const result: string[] = [];
  let currentLine = '';
  let currentChordLine = '';
  let currentLyricLine = '';
  let chordPositions: Array<{ pos: number; chord: string }> = [];

  const processNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      currentLine += text;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;

      if (element.classList.contains('chord')) {
        // Extract chord components
        const rootEl = element.querySelector('.chord-root');
        const qualityEl = element.querySelector('.chord-quality');
        const bassEl = element.querySelector('.chord-bass');

        let chordName = '';

        if (rootEl) {
          const root = rootEl.textContent?.trim() || '';
          chordName += transposeValue !== 0 ? transposeNote(root, transposeValue) : root;
        }

        if (qualityEl) {
          let quality = qualityEl.textContent?.trim() || '';
          quality = quality.replace(/\/+$/, '');
          chordName += quality;
        }

        if (bassEl) {
          const bass = bassEl.textContent?.trim() || '';
          if (bass) {
            chordName += '/' + (transposeValue !== 0 ? transposeNote(bass, transposeValue) : bass);
          }
        }

        // Mark chord position
        currentLine += `[${chordName}]`;
      } else if (element.tagName === 'BR') {
        // Process the line
        if (currentLine.trim()) {
          // Convert &nbsp; and clean up
          const cleanLine = currentLine.replace(/&nbsp;/g, ' ').trim();
          result.push(cleanLine);
        }
        currentLine = '';
      } else {
        node.childNodes.forEach(processNode);
      }
    }
  };

  tempDiv.childNodes.forEach(processNode);

  // Add last line if not empty
  if (currentLine.trim()) {
    const cleanLine = currentLine.replace(/&nbsp;/g, ' ').trim();
    result.push(cleanLine);
  }

  // Post-process to add section directives
  const processedResult: string[] = [];
  const sectionMarkerRegex = /^\s*\[(Verse|Chorus|Bridge|Intro|Outro|Pre-Chorus|Interlude|Solo|End)(\s+\d+)?\]\s*$/i;
  let inSection = false;
  let currentSection = '';
  let sectionLines: string[] = [];

  for (let i = 0; i < result.length; i++) {
    const line = result[i];
    const trimmedLine = line.trim();

    // Check if this is a section marker
    const sectionMatch = trimmedLine.match(sectionMarkerRegex);

    if (sectionMatch) {
      // Close previous section if open
      if (inSection && sectionLines.length > 0) {
        const directive = getSectionDirective(currentSection);
        if (directive) {
          processedResult.push(`{start_of_${directive}}`);
          processedResult.push(...sectionLines);
          processedResult.push(`{end_of_${directive}}`);
          processedResult.push('');
        } else {
          processedResult.push(`{comment: ${currentSection}}`);
          processedResult.push(...sectionLines);
          processedResult.push('');
        }
        sectionLines = [];
      }

      // Start new section
      const sectionName = sectionMatch[1];
      const sectionNumber = sectionMatch[2] ? sectionMatch[2].trim() : '';
      currentSection = `${sectionName}${sectionNumber}`;
      inSection = true;
    } else if (trimmedLine) {
      // Add content line to current section
      sectionLines.push(line);
    } else if (inSection && sectionLines.length > 0) {
      // Empty line - close current section
      const directive = getSectionDirective(currentSection);
      if (directive) {
        processedResult.push(`{start_of_${directive}}`);
        processedResult.push(...sectionLines);
        processedResult.push(`{end_of_${directive}}`);
        processedResult.push('');
      } else {
        processedResult.push(`{comment: ${currentSection}}`);
        processedResult.push(...sectionLines);
        processedResult.push('');
      }
      sectionLines = [];
      inSection = false;
    }
  }

  // Close final section if still open
  if (inSection && sectionLines.length > 0) {
    const directive = getSectionDirective(currentSection);
    if (directive) {
      processedResult.push(`{start_of_${directive}}`);
      processedResult.push(...sectionLines);
      processedResult.push(`{end_of_${directive}}`);
    } else {
      processedResult.push(`{comment: ${currentSection}}`);
      processedResult.push(...sectionLines);
    }
  }

  return processedResult.join('\n');
}

/**
 * Maps section names to ChordPro directives
 */
function getSectionDirective(sectionName: string): string {
  const lower = sectionName.toLowerCase();
  if (lower.startsWith('verse')) return 'verse';
  if (lower.startsWith('chorus')) return 'chorus';
  if (lower.startsWith('bridge')) return 'bridge';
  if (lower.startsWith('intro')) return 'verse'; // Use verse for intro
  if (lower.startsWith('outro')) return 'verse'; // Use verse for outro
  return ''; // Return empty for other types, will use comment instead
}

/**
 * Transposes a note by the given number of semitones
 */
function transposeNote(note: string, value: number): string {
  const noteNames = [
    ['A'],
    ['A#', 'Bb'],
    ['B', 'Cb'],
    ['C', 'B#'],
    ['C#', 'Db'],
    ['D'],
    ['D#', 'Eb'],
    ['E', 'Fb'],
    ['F', 'E#'],
    ['F#', 'Gb'],
    ['G'],
    ['G#', 'Ab'],
  ];

  const noteIndex = noteNames.findIndex((tone) => tone.includes(note));
  if (noteIndex === -1) {
    return note;
  }

  let newIndex = (noteIndex + value) % 12;
  if (newIndex < 0) {
    newIndex += 12;
  }

  return noteNames[newIndex][0];
}

/**
 * Parses ChordPro format text into structured data
 * Useful for importing ChordPro files
 */
export interface ChordProData {
  metadata: { [key: string]: string };
  content: string;
  chords: string[];
}

export function parseChordPro(chordProText: string): ChordProData {
  const lines = chordProText.split('\n');
  const metadata: { [key: string]: string } = {};
  const contentLines: string[] = [];
  const chords = new Set<string>();

  for (const line of lines) {
    // Check for directives
    const directiveMatch = line.match(/^\{(\w+):\s*(.+?)\}$/);
    if (directiveMatch) {
      const [, key, value] = directiveMatch;
      metadata[key] = value;
      continue;
    }

    // Extract chords from content
    const chordMatches = line.matchAll(/\[([^\]]+)\]/g);
    for (const match of chordMatches) {
      chords.add(match[1]);
    }

    contentLines.push(line);
  }

  return {
    metadata,
    content: contentLines.join('\n'),
    chords: Array.from(chords)
  };
}

/**
 * Converts ChordPro format to HTML for display
 */
export function chordProToHtml(chordProText: string): string {
  const lines = chordProText.split('\n');
  const htmlLines: string[] = [];

  for (const line of lines) {
    // Skip metadata directives for display
    if (line.match(/^\{(title|artist|capo|comment):/)) {
      continue;
    }

    // Convert chords to HTML spans
    let htmlLine = line.replace(/\[([^\]]+)\]/g, (match, chord) => {
      return `<span class="chord fw-bold">${chord}</span>`;
    });

    // Convert spaces to non-breaking spaces
    htmlLine = htmlLine.replace(/ /g, '&nbsp;');

    htmlLines.push(htmlLine);
  }

  return htmlLines.join('<br/>');
}

/**
 * Exports tab as a ChordPro file download
 */
export function exportChordProFile(tab: SongDetail, transposeValue: number = 0): void {
  const chordProContent = convertToChordPro(tab, transposeValue);
  const blob = new Blob([chordProContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  const filename = `${tab.artist_name} - ${tab.song_name}.cho`.replace(/[^a-z0-9\s\-_.]/gi, '_');
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
