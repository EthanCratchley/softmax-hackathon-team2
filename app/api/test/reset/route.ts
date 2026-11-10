import { NextResponse } from 'next/server';
import { resetMockServiceState } from '@/lib/services';

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production' || process.env.KESTREL_DATA !== 'mock' || process.env.KESTREL_TEST_RESET !== '1') {
    return new NextResponse(null, { status: 404 });
  }
  const options = await request.json().catch(() => ({})) as { communications?: boolean };
  resetMockServiceState(options.communications === true);
  return NextResponse.json({ reset: true });
}
