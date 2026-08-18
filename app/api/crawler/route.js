import { NextResponse } from 'next/server';
import { crawlMovies } from '../../../utils/crawler';

export async function POST() {
  try {
    const result = await crawlMovies();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}