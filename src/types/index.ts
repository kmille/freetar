export interface SearchResult {
  artist_name: string;
  song_name: string;
  tab_url: string;
  artist_url: string;
  type: string;
  version: number;
  votes: number;
  rating: number;
}

export interface ChordVariant {
  [fret: number]: number[];
}

export interface SongDetail {
  tab: string;
  artist_name: string;
  song_name: string;
  version: number;
  type: string;
  votes: number;
  rating: number;
  difficulty: string;
  capo?: number | null;
  tuning?: string | null;
  tab_url: string;
  alternatives: SearchResult[];
  chords: { [chordName: string]: ChordVariant[] };
  fingers_for_strings: { [chordName: string]: string[][] };
}

export interface SearchResponse {
  results: SearchResult[];
  total_pages: number;
  current_page: number;
}

export class FreetarError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FreetarError';
  }
}
