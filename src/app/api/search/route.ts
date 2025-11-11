import { NextRequest, NextResponse } from 'next/server';
import { searchTabs } from '@/lib/ug';
import { FreetarError } from '@/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const searchTerm = searchParams.get('search_term');
  const page = parseInt(searchParams.get('page') || '1');

  if (!searchTerm) {
    return NextResponse.json(
      { error: 'search_term parameter is required' },
      { status: 400 }
    );
  }

  try {
    const results = await searchTabs(searchTerm, page);
    return NextResponse.json(results);
  } catch (error) {
    if (error instanceof FreetarError) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
