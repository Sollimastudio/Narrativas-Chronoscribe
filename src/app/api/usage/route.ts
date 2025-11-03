import { NextResponse } from 'next/server';
import { storageService } from '@/server/storage/google-storage';
import { BadRequestError, ProviderError } from '@/utils/errors';

export async function POST(request: Request) {
  try {
    // Cria um arquivo de teste
    const testBuffer = Buffer.from('Teste de Storage do Narrativas Chronoscribe');
    const fileName = `teste-${Date.now()}.txt`;
    
    const url = await storageService.uploadPDF(testBuffer, fileName);
    
    return NextResponse.json({ 
      success: true, 
      url,
      message: 'Teste de storage realizado com sucesso'
    });

  } catch (error) {
    if (error instanceof BadRequestError || error instanceof ProviderError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    console.error('Erro não tratado:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}