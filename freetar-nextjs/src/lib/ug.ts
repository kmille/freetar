import axios from 'axios';
import * as cheerio from 'cheerio';
import { SearchResult, SongDetail, SearchResponse, FreetarError, ChordVariant } from '@/types';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.3';

export async function searchTabs(searchTerm: string, page: number = 1): Promise<SearchResponse> {
  try {
    const url = `https://www.ultimate-guitar.com/search.php?page=${page}&search_type=title&value=${encodeURIComponent(searchTerm)}`;
    const response = await axios.get(url, {
      headers: { 'User-Agent': USER_AGENT }
    });

    const $ = cheerio.load(response.data);
    const storeDiv = $('div.js-store');
    const dataContent = storeDiv.attr('data-content');

    if (!dataContent) {
      throw new FreetarError(`Could not find any chords for '${searchTerm}'.`);
    }

    const data = JSON.parse(dataContent);
    const results = getResults(data);
    const totalPages = data.store.page.data.pagination.total;
    const currentPage = data.store.page.data.pagination.current;

    return {
      results,
      total_pages: totalPages,
      current_page: currentPage
    };
  } catch (error: any) {
    if (error instanceof FreetarError) {
      throw error;
    }
    if (axios.isAxiosError(error)) {
      throw new FreetarError(`Could not find any chords for '${searchTerm}'.`);
    }
    throw new FreetarError(`Could not search for chords: ${error.message}`);
  }
}

function getResults(data: any): SearchResult[] {
  const results = data.store.page.data.results;
  const ugResults: SearchResult[] = [];

  for (const result of results) {
    const type = result.type;
    if (type && type !== 'Pro' && type !== 'Official') {
      const url = new URL(result.tab_url);
      ugResults.push({
        artist_name: result.artist_name,
        song_name: result.song_name,
        tab_url: url.pathname,
        artist_url: result.artist_url,
        type: result.type,
        version: result.version,
        votes: parseInt(result.votes),
        rating: Math.round(result.rating * 10) / 10
      });
    }
  }

  return ugResults;
}

export async function getTab(urlPath: string): Promise<SongDetail> {
  try {
    const url = `https://tabs.ultimate-guitar.com/tab/${urlPath}`;
    const response = await axios.get(url, {
      headers: { 'User-Agent': USER_AGENT }
    });

    const $ = cheerio.load(response.data);
    const storeDiv = $('div.js-store');
    const dataContent = storeDiv.attr('data-content');

    if (!dataContent) {
      throw new FreetarError('Could not parse tab data');
    }

    const data = JSON.parse(dataContent);
    const songDetail = parseSongDetail(data);

    return songDetail;
  } catch (error: any) {
    if (error instanceof FreetarError) {
      throw error;
    }
    throw new FreetarError(`Could not parse chord: ${error.message}`);
  }
}

function parseSongDetail(data: any): SongDetail {
  let tab = data.store.page.data.tab_view.wiki_tab.content;
  const artistName = data.store.page.data.tab.artist_name;
  const songName = data.store.page.data.tab.song_name;
  const version = parseInt(data.store.page.data.tab.version);
  const type = data.store.page.data.tab.type;
  const rating = parseInt(data.store.page.data.tab.rating);
  const difficulty = data.store.page.data.tab_view.ug_difficulty;
  const applicature = data.store.page.data.tab_view.applicature;
  const tabUrl = data.store.page.data.tab.tab_url;

  let capo = null;
  let tuning = null;

  if (typeof data.store.page.data.tab_view.meta === 'object' && data.store.page.data.tab_view.meta !== null) {
    capo = data.store.page.data.tab_view.meta.capo || null;
    const tuningData = data.store.page.data.tab_view.meta.tuning;
    tuning = tuningData ? `${tuningData.value} (${tuningData.name})` : null;
  }

  const alternatives: SearchResult[] = [];
  for (const alternative of data.store.page.data.tab_view.versions) {
    if (alternative.type && alternative.type !== 'Official') {
      const url = new URL(alternative.tab_url);
      alternatives.push({
        artist_name: alternative.artist_name,
        song_name: alternative.song_name,
        tab_url: url.pathname,
        artist_url: alternative.artist_url,
        type: alternative.type,
        version: alternative.version,
        votes: parseInt(alternative.votes || 0),
        rating: Math.round((alternative.rating || 0) * 10) / 10
      });
    }
  }

  // Fix tab formatting
  tab = fixTab(tab);

  // Get chords
  const { chords, fingerings } = getChords(applicature);

  return {
    tab,
    artist_name: artistName,
    song_name: songName,
    version,
    type,
    rating,
    difficulty,
    capo,
    tuning,
    tab_url: tabUrl,
    alternatives,
    chords,
    fingers_for_strings: fingerings
  };
}

function fixTab(tab: string): string {
  tab = tab.replace(/\r\n/g, '<br/>');
  tab = tab.replace(/\n/g, '<br/>');
  tab = tab.replace(/ /g, '&nbsp;');
  tab = tab.replace(/\[tab\]/g, '');
  tab = tab.replace(/\[\/tab\]/g, '');

  // Parse chords with regex
  const chordRegex = /\[ch\](?<root>[A-Ha-h](#|b)?)(?<quality>[^\[\/]+)?(?<bass>\/[A-Ha-h](#|b)?)?\[\/ch\]/g;
  tab = tab.replace(chordRegex, (match, root, quality, bass) => {
    const rootSpan = `<span class="chord-root">${root}</span>`;
    const qualitySpan = quality ? `<span class="chord-quality">${quality}</span>` : '';
    const bassSpan = bass ? `/<span class="chord-bass">${bass.substring(1)}</span>` : '';
    return `<span class="chord fw-bold">${rootSpan}${qualitySpan}${bassSpan}</span>`;
  });

  return tab;
}

function getChords(applicature: any): {
  chords: { [chordName: string]: ChordVariant[] },
  fingerings: { [chordName: string]: string[][] }
} {
  if (!applicature) {
    return { chords: {}, fingerings: {} };
  }

  const chords: { [chordName: string]: ChordVariant[] } = {};
  const fingerings: { [chordName: string]: string[][] } = {};

  for (const chord in applicature) {
    for (const chordVariant of applicature[chord]) {
      const frets = chordVariant.frets;
      const minFret = Math.min(...frets);
      const maxFret = Math.max(...frets);
      const possibleFrets = [];

      for (let i = minFret; i <= maxFret; i++) {
        possibleFrets.push(i);
      }

      const variantsTemp: { [fret: number]: number[] } = {};
      for (const possibleFret of possibleFrets) {
        if (possibleFret > 0) {
          variantsTemp[possibleFret] = frets.map(b => b === possibleFret ? 1 : 0).reverse();
        }
      }

      const variants: ChordVariant = {};
      let found = false;

      for (const [fret, fingers] of Object.entries(variantsTemp)) {
        if (!found && fingers.includes(1)) {
          found = true;
        }
        if (found) {
          variants[parseInt(fret)] = fingers;
        }
      }

      if (Object.keys(variants).length === 0) {
        continue;
      }

      // Pad to 6 frets
      while (Object.keys(variants).length < 6) {
        const maxKey = Math.max(...Object.keys(variants).map(k => parseInt(k)));
        variants[maxKey + 1] = [0, 0, 0, 0, 0, 0];
      }

      // Calculate unstrummed strings
      const variantStringsPressed = Object.values(variants);
      const summedStrings = [0, 0, 0, 0, 0, 0];
      for (const variant of variantStringsPressed) {
        for (let i = 0; i < 6; i++) {
          summedStrings[i] += variant[i];
        }
      }
      const unstrummedStrings = summedStrings.map(y => y === 0 ? 1 : 0);

      // Build fingering
      const fingeringForVariant: string[] = [];
      const reversedFingers = [...chordVariant.fingers].reverse();
      for (let i = 0; i < reversedFingers.length; i++) {
        fingeringForVariant.push(unstrummedStrings[i] ? 'x' : reversedFingers[i]);
      }

      if (!chords[chord]) {
        chords[chord] = [];
        fingerings[chord] = [];
      }
      chords[chord].push(variants);
      fingerings[chord].push(fingeringForVariant);
    }
  }

  return { chords, fingerings };
}
