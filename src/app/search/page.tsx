'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { SearchResponse } from '@/types';
import SearchResults from '@/components/SearchResults';
import { FaCircleInfo, FaCircleExclamation } from 'react-icons/fa6';

function SearchPageContent() {
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
      <div className="w-full">
        <div className="alert alert-info">
          <FaCircleInfo className="text-xl" />
          <span>Enter a search term to find guitar chords and tabs.</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[50vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="alert alert-error">
          <FaCircleExclamation className="text-xl" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!results) return null;

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-6">Search Results for &quot;{searchTerm}&quot;</h1>
      <SearchResults
        results={results.results}
        currentPage={results.current_page}
        totalPages={results.total_pages}
        searchTerm={searchTerm}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="w-full flex justify-center items-center min-h-[50vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
