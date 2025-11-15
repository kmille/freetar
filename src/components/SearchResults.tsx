'use client';

import { SearchResult } from '@/types';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaStar, FaRegStar, FaCaretDown, FaCaretUp, FaDownload } from 'react-icons/fa6';

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

  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig?.key !== column) {
      return <FaCaretDown className="opacity-30" />;
    }
    return sortConfig.direction === 'asc' ? <FaCaretDown /> : <FaCaretUp />;
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="table table-zebra">
          <thead>
            <tr>
              <th
                className={`cursor-pointer select-none ${sortConfig?.key === 'artist' ? 'order-active' : 'order-inactive'}`}
                onClick={() => handleSort('artist')}
              >
                <div className="flex items-center gap-2">
                  Artist <SortIcon column="artist" />
                </div>
              </th>
              <th
                className={`cursor-pointer select-none ${sortConfig?.key === 'song' ? 'order-active' : 'order-inactive'}`}
                onClick={() => handleSort('song')}
              >
                <div className="flex items-center gap-2">
                  Song <SortIcon column="song" />
                </div>
              </th>
              <th
                className={`cursor-pointer select-none ${sortConfig?.key === 'rating' ? 'order-active' : 'order-inactive'}`}
                onClick={() => handleSort('rating')}
              >
                <div className="flex items-center gap-2">
                  Rating <SortIcon column="rating" />
                </div>
              </th>
              <th
                className={`cursor-pointer select-none ${sortConfig?.key === 'type' ? 'order-active' : 'order-inactive'}`}
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center gap-2">
                  Type <SortIcon column="type" />
                </div>
              </th>
              <th>Favorite</th>
            </tr>
          </thead>
          <tbody>
            {sortedResults.map((result, index) => (
              <tr key={index} className="hover">
                <td>
                  <Link
                    href={`/search?search_term=${encodeURIComponent(result.artist_name)}`}
                    className="link link-hover font-medium"
                  >
                    {result.artist_name}
                  </Link>
                </td>
                <td>
                  <Link
                    href={`/tab?path=${result.tab_url.replace('/tab/', '')}`}
                    className="link link-hover link-primary font-medium"
                  >
                    {result.song_name} <span className="text-sm opacity-70">(ver {result.version})</span>
                  </Link>
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">{result.rating}</span>
                    <span className="text-sm opacity-70">/5</span>
                    <span className="text-xs opacity-50">({result.votes})</span>
                  </div>
                </td>
                <td>
                  <div className="badge badge-outline badge-sm">{result.type}</div>
                </td>
                <td>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => toggleFavorite(result)}
                    aria-label="Toggle favorite"
                  >
                    {isFavorite(result.tab_url) ? (
                      <FaStar className="text-yellow-500 text-lg" />
                    ) : (
                      <FaRegStar className="text-lg" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="join">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <span key={page}>
                {page === currentPage ? (
                  <button className="join-item btn btn-active">{page}</button>
                ) : (
                  <Link href={`/search?search_term=${encodeURIComponent(searchTerm)}&page=${page}`}>
                    <button className="join-item btn">{page}</button>
                  </Link>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="collapse collapse-arrow bg-base-200 mt-6">
        <input type="checkbox" />
        <div className="collapse-title text-lg font-medium">Advanced Options</div>
        <div className="collapse-content">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-semibold mb-2">Export Favorites</h3>
              <button className="btn btn-secondary btn-sm gap-2" onClick={exportFavorites}>
                <FaDownload /> Export to JSON
              </button>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Import Favorites</h3>
              <input
                type="file"
                className="file-input file-input-bordered file-input-sm w-full max-w-xs"
                onChange={importFavorites}
                accept=".json"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
