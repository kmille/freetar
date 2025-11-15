import { NextRequest, NextResponse } from 'next/server';
import { getTab } from '@/lib/ug';
import { FreetarError } from '@/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get('path');

  if (!path) {
    return NextResponse.json(
      { error: 'path parameter is required' },
      { status: 400 }
    );
  }

  try {
    const tab = await getTab(path);
    return NextResponse.json(tab);
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
