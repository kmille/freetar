'use client';

import { SongDetail } from '@/types';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ChordDiagram from './ChordDiagram';
import { convertToChordPro, exportChordProFile, chordProToHtml } from '@/lib/chordpro';

interface TabDisplayProps {
  tab: SongDetail;
}

export default function TabDisplay({ tab }: TabDisplayProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [transposeValue, setTransposeValue] = useState(0);
  const [showChords, setShowChords] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollTimeout, setScrollTimeout] = useState(500);
  const [viewMode, setViewMode] = useState<'html' | 'chordpro'>('html');
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pausedForUserInteraction = useRef(false);

  const SCROLL_STEP_SIZE = 3;
  const SCROLL_DELAY_AFTER_USER_ACTION = 500;

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
    const currentPath = window.location.pathname;
    setIsFavorite(currentPath in favorites);
  }, []);

  useEffect(() => {
    const handleUserInteraction = () => {
      pauseScrolling(SCROLL_DELAY_AFTER_USER_ACTION);
    };

    window.addEventListener('wheel', handleUserInteraction);
    window.addEventListener('touchmove', handleUserInteraction);

    return () => {
      window.removeEventListener('wheel', handleUserInteraction);
      window.removeEventListener('touchmove', handleUserInteraction);
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
    const currentPath = window.location.pathname;

    if (currentPath in favorites) {
      delete favorites[currentPath];
      setIsFavorite(false);
    } else {
      favorites[currentPath] = {
        artist_name: tab.artist_name,
        song: tab.song_name,
        type: tab.type,
        rating: tab.rating,
        tab_url: currentPath,
      };
      setIsFavorite(true);
    }

    localStorage.setItem('favorites', JSON.stringify(favorites));
  };

  const pageScroll = () => {
    if (pausedForUserInteraction.current) return;
    window.scrollBy(0, SCROLL_STEP_SIZE);
  };

  const startScrolling = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
    }
    scrollIntervalRef.current = setInterval(pageScroll, scrollTimeout);
  };

  const pauseScrolling = (delay: number) => {
    pausedForUserInteraction.current = true;
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    pauseTimeoutRef.current = setTimeout(() => {
      pausedForUserInteraction.current = false;
    }, delay);
  };

  const stopScrolling = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  };

  const toggleScroll = (checked: boolean) => {
    setIsScrolling(checked);
    if (checked) {
      startScrolling();
    } else {
      stopScrolling();
    }
  };

  const adjustScrollSpeed = (increase: boolean) => {
    if (increase) {
      setScrollTimeout((prev) => Math.max(50, prev - 50));
    } else {
      setScrollTimeout((prev) => prev + 50);
    }

    if (isScrolling) {
      stopScrolling();
      setTimeout(() => startScrolling(), 100);
    }
  };

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

  const transposeNote = (note: string, value: number): string => {
    const noteIndex = noteNames.findIndex((tone) => tone.includes(note));
    if (noteIndex === -1) {
      return note;
    }

    let newIndex = (noteIndex + value) % 12;
    if (newIndex < 0) {
      newIndex += 12;
    }

    return noteNames[newIndex][0];
  };

  const getTransposedTab = (html: string, value: number): string => {
    if (value === 0) return html;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const chordElements = tempDiv.querySelectorAll('.chord-root, .chord-bass');
    chordElements.forEach((element) => {
      const originalText = element.textContent?.trim() || '';
      element.textContent = transposeNote(originalText, value);
    });

    return tempDiv.innerHTML;
  };

  const getDisplayContent = (): string => {
    if (viewMode === 'chordpro') {
      const chordProText = convertToChordPro(tab, transposeValue);
      return chordProToHtml(chordProText);
    }
    return getTransposedTab(tab.tab, transposeValue);
  };

  const handleExportChordPro = () => {
    exportChordProFile(tab, transposeValue);
  };

  const copyChordProToClipboard = async () => {
    const chordProText = convertToChordPro(tab, transposeValue);
    try {
      await navigator.clipboard.writeText(chordProText);
      alert('ChordPro format copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    }
  };

  return (
    <>
      <div className="col-sm col-md-8 col-lg-9 col-12">
        <h5>
          <Link href={`/search?search_term=${encodeURIComponent(tab.artist_name)}`}>
            {tab.artist_name}
          </Link>{' '}
          - {tab.song_name} (ver {tab.version})
          <span
            title="add/remove song to/from favs"
            className={`favorite m-2 d-print-none ${isFavorite ? 'active' : ''}`}
            onClick={toggleFavorite}
            data-artist={tab.artist_name}
            data-song={tab.song_name}
            data-type={tab.type}
            data-rating={tab.rating}
          >
            ★
          </span>
        </h5>
      </div>

      <div className="col-sm col-md-4 col-lg-3">
        View on{' '}
        <a className="d-print-none" href={`${tab.tab_url}?no_redirect`} target="_blank" rel="noopener noreferrer">
          Ultimate Guitar
        </a>
      </div>

      <div className="col-sm col-md-9 col-lg-9">Difficulty: {tab.difficulty}
</div>

      <div className="col-sm col-md-3 col-lg-3">
        Capo: {tab.capo ? `${tab.capo}th fret` : 'no capo'}
      </div>

      {tab.tuning && (
        <div className="col-sm col-lg-12">Tuning: {tab.tuning}
</div>
      )}

      <div className="d-flex align-items-center d-print-none flex-wrap mb-3">
        <div className="form-check form-switch autoscroll me-4">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="checkbox_autoscroll"
            checked={isScrolling}
            onChange={(e) => toggleScroll(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="checkbox_autoscroll">
            Autoscroll
          </label>
          <span
            role="button"
            id="scroll_speed_down"
            title="decrease scroll speed"
            className="m-2"
            onClick={() => adjustScrollSpeed(false)}
          >
            ❮❮
          </span>
          <span
            role="button"
            id="scroll_speed_up"
            title="increase scroll speed"
            className="m-2"
            onClick={() => adjustScrollSpeed(true)}
          >
            ❯❯
          </span>
        </div>

        <div className="form-check form-switch me-4">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="checkbox_view_chords"
            checked={showChords}
            onChange={(e) => setShowChords(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="checkbox_view_chords">
            Show chords
          </label>
        </div>

        <div className="me-4">
          <span>Transpose </span>
          <span
            role="button"
            id="transpose_down"
            title="transpose down"
            className="m-2"
            onClick={() => setTransposeValue((prev) => Math.max(-11, prev - 1))}
          >
            ↓
          </span>
          <span
            role="button"
            id="transpose_up"
            title="transpose up"
            className="m-2"
            onClick={() => setTransposeValue((prev) => Math.min(11, prev + 1))}
          >
            ↑
          </span>
          {transposeValue !== 0 && (
            <span
              role="button"
              id="transposed_steps"
              className="m-2"
              onClick={() => setTransposeValue(0)}
            >
              {transposeValue > 0 ? '+' : ''}
              {transposeValue}
            </span>
          )}
        </div>
      </div>

      <div className="d-flex align-items-center d-print-none flex-wrap mb-3">
        <div className="btn-group me-3" role="group">
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'html' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('html')}
          >
            HTML View
          </button>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'chordpro' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setViewMode('chordpro')}
          >
            ChordPro View
          </button>
        </div>

        <button
          type="button"
          className="btn btn-sm btn-success me-2"
          onClick={handleExportChordPro}
          title="Export as ChordPro file (.cho)"
        >
          📥 Export ChordPro
        </button>

        <button
          type="button"
          className="btn btn-sm btn-info"
          onClick={copyChordProToClipboard}
          title="Copy ChordPro format to clipboard"
        >
          📋 Copy ChordPro
        </button>
      </div>

      <hr className="border border-primary" />

      {showChords && Object.keys(tab.chords).length > 0 && (
        <>
          <div
            id="chordVisuals"
            className="d-grid"
            style={{
              gridGap: '3rem',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100px, 100%), 1fr))',
            }}
          >
            {Object.keys(tab.chords).map((chordName) => {
              const chordVariants = tab.chords[chordName];
              const fingering = tab.fingers_for_strings[chordName];
              if (chordVariants.length === 0) return null;

              return (
                <ChordDiagram
                  key={chordName}
                  chordName={chordName}
                  chordMap={chordVariants[0]}
                  fingering={fingering[0]}
                />
              );
            })}
          </div>
          <hr className="border border-primary" />
        </>
      )}

      <div
        className="tab font-monospace"
        dangerouslySetInnerHTML={{ __html: getDisplayContent() }}
      />

      {tab.alternatives && tab.alternatives.length > 0 && (
        <div className="d-print-none mt-4">
          <h2>Alternative versions</h2>
          <ul className="list-unstyled">
            {tab.alternatives.map((alt, index) => (
              <li key={index}>
                <Link href={`/tab?path=${alt.tab_url.replace('/tab/', '')}`}>
                  Version {alt.version} ({alt.type}) {alt.rating}/5 ({alt.votes})
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
