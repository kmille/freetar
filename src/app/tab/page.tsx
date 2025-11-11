'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { SongDetail } from '@/types';
import TabDisplay from '@/components/TabDisplay';
import { FaTriangleExclamation, FaCircleExclamation } from 'react-icons/fa6';

function TabPageContent() {
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
      <div className="w-full">
        <div className="alert alert-warning">
          <FaTriangleExclamation className="text-xl" />
          <span>Invalid tab path.</span>
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

  if (!tab) return null;

  return <TabDisplay tab={tab} />;
}

export default function TabPage() {
  return (
    <Suspense fallback={
      <div className="w-full flex justify-center items-center min-h-[50vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    }>
      <TabPageContent />
    </Suspense>
  );
}
