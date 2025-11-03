import { type NextRequest } from 'next/server';
import { rateLimiter } from './middleware/rate-limit';

export async function middleware(request: NextRequest) {
  // Aplica rate limiting apenas na rota de compartilhamento
  if (request.nextUrl.pathname === '/api/share') {
    return rateLimiter(request);
  }
}
