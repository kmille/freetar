'use client';

import SearchResults from '@/components/SearchResults';
import { useState, useEffect } from 'react';
import { SearchResult } from '@/types';
import { FaStar } from 'react-icons/fa6';

export default function Home() {
  const [favorites, setFavorites] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    const storedFavorites = localStorage.getItem('favorites');
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  const favoriteResults: SearchResult[] = Object.values(favorites).map((fav: any) => ({
    artist_name: fav.artist_name,
    song_name: fav.song,
    tab_url: fav.tab_url,
    artist_url: '',
    type: fav.type,
    version: 0,
    votes: 0,
    rating: parseFloat(fav.rating) || 0,
  }));

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6">Your Favorites</h1>
      {favoriteResults.length > 0 ? (
        <SearchResults
          results={favoriteResults}
          currentPage={1}
          totalPages={1}
          searchTerm=""
        />
      ) : (
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body text-center">
            <FaStar className="text-6xl mb-4 text-yellow-500 mx-auto" />
            <h2 className="card-title justify-center">No favorites yet</h2>
            <p className="text-base-content/70">
              Search for tabs and click the star to add them to your favorites!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
