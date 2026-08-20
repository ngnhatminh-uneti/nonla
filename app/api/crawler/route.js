import { NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { crawlMovies } from '../../../utils/crawler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function isAuthorized(request) {
  const secret = process.env.CRON_SECRET;
  const provided = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();

  if (!secret || !provided || provided.length !== secret.length) return false;

  try {
    return timingSafeEqual(Buffer.from(provided), Buffer.from(secret));
  } catch {
    return false;
  }
}

export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await crawlMovies();
    return NextResponse.json(result, { status: result.success ? 200 : 502 });
  } catch (error) {
    console.error('[crawler]', error);
    return NextResponse.json(
      { success: false, error: 'Crawler failed' },
      { status: 500 }
    );
  }
}
