'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SongDetail } from '@/types';
import TabDisplay from '@/components/TabDisplay';

export default function TabPage() {
  const searchParams = useSearchParams();
  const path = searchParams.get('path');

  const [tab, setTab] = useState<SongDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!path) return;

    const fetchTab = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/tab?path=${encodeURIComponent(path)}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch tab');
        }
        const data = await response.json();
        setTab(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTab();
  }, [path]);

  if (!path) {
    return (
      <div className="col-12">
        <p>Invalid tab path.</p>
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

  if (!tab) return null;

  return <TabDisplay tab={tab} />;
}
