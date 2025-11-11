'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SearchResponse } from '@/types';
import SearchResults from '@/components/SearchResults';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search_term') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchTerm) return;

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/search?search_term=${encodeURIComponent(searchTerm)}&page=${page}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch results');
        }
        const data = await response.json();
        setResults(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchTerm, page]);

  if (!searchTerm) {
    return (
      <div className="col-12">
        <p>Enter a search term to find guitar chords and tabs.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="col-12">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-12">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="col-12">
      <h2 className="mb-3">Search Results for &quot;{searchTerm}&quot;</h2>
      <SearchResults
        results={results.results}
        currentPage={results.current_page}
        totalPages={results.total_pages}
        searchTerm={searchTerm}
      />
    </div>
  );
}
