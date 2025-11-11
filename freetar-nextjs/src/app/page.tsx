'use client';

import SearchResults from '@/components/SearchResults';
import { useState, useEffect } from 'react';
import { SearchResult } from '@/types';

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
    <div className="col-12">
      <h2 className="mb-3">Your Favorites</h2>
      {favoriteResults.length > 0 ? (
        <SearchResults
          results={favoriteResults}
          currentPage={1}
          totalPages={1}
          searchTerm=""
        />
      ) : (
        <p>No favorites yet. Search for tabs and click the star to add them to your favorites!</p>
      )}
    </div>
  );
}
