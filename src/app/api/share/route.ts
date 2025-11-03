import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/prisma/client';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
  try {
    const { content, expiresIn = '7d' } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: 'Missing content' },
        { status: 400 }
      );
    }

    // Gera um ID único para o compartilhamento
    const shareId = nanoid(10);

    // Calcula a data de expiração
    const expiresAt = new Date();
    const value = parseInt(expiresIn);
    const unit = expiresIn.replace(/\d+/, '');
    
    switch (unit) {
      case 'd':
        expiresAt.setDate(expiresAt.getDate() + value);
        break;
      case 'h':
        expiresAt.setHours(expiresAt.getHours() + value);
        break;
      default:
        expiresAt.setDate(expiresAt.getDate() + 7); // default 7 dias
    }

    // Salva o conteúdo no banco de dados
    const share = await prisma.contentShare.create({
      data: {
        id: shareId,
        content: JSON.stringify(content),
        expiresAt,
      },
    });

    return NextResponse.json({
      shareId: share.id,
      expiresAt: share.expiresAt,
      shareUrl: `${process.env.NEXT_PUBLIC_APP_URL}/share/${share.id}`,
    });
  } catch (error) {
    console.error('[/api/share]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
