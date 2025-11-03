import { redis } from '@/server/redis';
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

const RATE_LIMIT = {
  window: 60 * 60, // 1 hora
  max: 10, // máximo de 10 compartilhamentos por hora
};

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = token.sub;
    const key = `rate-limit:share:${userId}`;

    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, RATE_LIMIT.window);
    }

    if (count > RATE_LIMIT.max) {
      return NextResponse.json(
        { error: 'Limite de compartilhamentos excedido. Tente novamente em breve.' },
        { status: 429 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Rate Limit API]', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
