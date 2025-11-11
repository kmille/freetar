'use client';

import { SearchResult } from '@/types';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface SearchResultsProps {
  results: SearchResult[];
  currentPage: number;
  totalPages: number;
  searchTerm: string;
}

export default function SearchResults({ results, currentPage, totalPages, searchTerm }: SearchResultsProps) {
  const [favorites, setFavorites] = useState<{ [key: string]: any }>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  const toggleFavorite = (result: SearchResult) => {
    const newFavorites = { ...favorites };
    const key = result.tab_url.split('?')[0];

    if (key in newFavorites) {
      delete newFavorites[key];
    } else {
      newFavorites[key] = {
        artist_name: result.artist_name,
        song: result.song_name,
        type: result.type,
        rating: result.rating,
        tab_url: result.tab_url,
      };
    }

    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const isFavorite = (tabUrl: string) => {
    return tabUrl.split('?')[0] in favorites;
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedResults = [...results].sort((a, b) => {
    if (!sortConfig) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortConfig.key) {
      case 'artist':
        aValue = a.artist_name;
        bValue = b.artist_name;
        break;
      case 'song':
        aValue = a.song_name;
        bValue = b.song_name;
        break;
      case 'rating':
        aValue = a.rating;
        bValue = b.rating;
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const exportFavorites = () => {
    const blob = new Blob([JSON.stringify(favorites)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'freetar-favorites.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const importFavorites = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        localStorage.setItem('favorites', content);
        setFavorites(JSON.parse(content));
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <div className="table-responsive">
        <table id="results" className="table">
          <thead>
            <tr>
              <th
                scope="col"
                className={`order ${sortConfig?.key === 'artist' ? 'order-active' : 'order-inactive'}`}
                onClick={() => handleSort('artist')}
                style={{ cursor: 'pointer' }}
              >
                artist{' '}
                <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                  {sortConfig?.key === 'artist' ? (sortConfig.direction === 'asc' ? '▼' : '▲') : '▼'}
                </span>
              </th>
              <th
                scope="col"
                className={`order ${sortConfig?.key === 'song' ? 'order-active' : 'order-inactive'}`}
                onClick={() => handleSort('song')}
                style={{ cursor: 'pointer' }}
              >
                song{' '}
                <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                  {sortConfig?.key === 'song' ? (sortConfig.direction === 'asc' ? '▼' : '▲') : '▼'}
                </span>
              </th>
              <th
                scope="col"
                className={`order ${sortConfig?.key === 'rating' ? 'order-active' : 'order-inactive'}`}
                onClick={() => handleSort('rating')}
                style={{ cursor: 'pointer' }}
              >
                rating{' '}
                <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                  {sortConfig?.key === 'rating' ? (sortConfig.direction === 'asc' ? '▼' : '▲') : '▼'}
                </span>
              </th>
              <th
                scope="col"
                className={`order ${sortConfig?.key === 'type' ? 'order-active' : 'order-inactive'}`}
                onClick={() => handleSort('type')}
                style={{ cursor: 'pointer' }}
              >
                type{' '}
                <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                  {sortConfig?.key === 'type' ? (sortConfig.direction === 'asc' ? '▼' : '▲') : '▼'}
                </span>
              </th>
              <th scope="col">favorite</th>
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((result, index) => (
              <tr key={index}>
                <td className="artist">
                  <Link href={`/search?search_term=${encodeURIComponent(result.artist_name)}`}>
                    {result.artist_name}
                  </Link>
                </td>
                <td className="song">
                  <Link href={`/tab?path=${result.tab_url.replace('/tab/', '')}`}>
                    {result.song_name} (ver {result.version})
                  </Link>
                </td>
                <td className="rating" data-value={result.rating}>
                  {result.rating}/5 ({result.votes})
                </td>
                <td className="type">{result.type}</td>
                <td>
                  <span
                    className={`favorite ${isFavorite(result.tab_url) ? 'active' : ''}`}
                    onClick={() => toggleFavorite(result)}
                    data-artist={result.artist_name}
                    data-song={result.song_name}
                    data-type={result.type}
                    data-rating={result.rating}
                    data-url={result.tab_url}
                  >
                    ★
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-3">
          More results
          <table>
            <tbody>
              <tr>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <td key={page}>
                    {page === currentPage ? (
                      <span>{page}</span>
                    ) : (
                      <Link href={`/search?search_term=${encodeURIComponent(searchTerm)}&page=${page}`}>
                        {page}
                      </Link>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <details className="mt-3">
        <summary>Advanced</summary>
        <strong className="d-block">Export favorites</strong>
        <button type="button" className="btn btn-secondary" onClick={exportFavorites}>
          Export
        </button>
        <br />
        <strong className="mt-3 d-block">Import favorites</strong>
        <input type="file" className="form-control" onChange={importFavorites} />
      </details>
    </>
  );
}
