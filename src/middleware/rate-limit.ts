import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function rateLimiter(req: NextRequest) {
  try {
    // Make an internal request to the rate limit API
    const rateLimit = await fetch(`${req.nextUrl.origin}/api/rate-limit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward the authorization header
        'Cookie': req.headers.get('cookie') || '',
      },
    });

    if (!rateLimit.ok) {
      const error = await rateLimit.json();
      return NextResponse.json({ error: error.error }, { status: rateLimit.status });
    }

    return NextResponse.next();
  } catch (error) {
    console.error('[Rate Limiter Middleware]', error);
    // Em caso de erro no rate limiting, permitimos a requisição
    return NextResponse.next();
  }
}
