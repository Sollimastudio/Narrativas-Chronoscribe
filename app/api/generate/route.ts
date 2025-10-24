import { NextRequest, NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// --- Variáveis de Ambiente e Fallback ---
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'chronoscribe-narratives';
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-1.0-pro'; // Fallback mais seguro
const CREDENTIALS_PATH = process.env.GOOGLE_APPLICATION_CREDENTIALS;
const CREDENTIALS_BASE64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;

// Caminho temporário para o arquivo JSON da chave Base64 (se usado)
const TEMP_CREDENTIALS_FILE = path.join(os.tmpdir(), 'vertex-key-temp.json');

// Função que resolve o arquivo de credenciais (caminho local ou Base64)
function resolveCredentialsFile(): string | undefined {
  // 1. Prioriza o caminho local se estiver definido (uso em desenvolvimento)
  if (CREDENTIALS_PATH) {
    return CREDENTIALS_PATH;
  }

  // 2. Se houver Base64 (uso em Vercel/Produção), decodifica e salva em arquivo temporário
  if (CREDENTIALS_BASE64) {
    try {
      // Decodifica o Base64 para JSON
      const jsonContent = Buffer.from(CREDENTIALS_BASE64, 'base64').toString('utf8');
      
      // Salva o JSON em um arquivo temporário
      fs.writeFileSync(TEMP_CREDENTIALS_FILE, jsonContent, 'utf8');

      // Retorna o caminho do arquivo temporário
      return TEMP_CREDENTIALS_FILE;
    } catch (error) {
      console.error("ERRO [Base64 Decode]: Falha ao decodificar ou salvar o arquivo de credenciais Base64.", error);
      return undefined; // Falha na decodificação
    }
  }

  // 3. Se nada for encontrado, retorna undefined para usar o Application Default Credentials (gcloud auth)
  return undefined; 
}


export async function POST(request: NextRequest) {
  let credentialsFilePath: string | undefined;

  try {
    const { promptParaIA, superPrompt } = await request.json();

    // Resolve o caminho das credenciais (se for Base64, ele salva o arquivo e pega o caminho)
    credentialsFilePath = resolveCredentialsFile();
    
    // Configuração do Vertex AI
    const vertexInit: { project: string; location: string; keyFile?: string } = {
      project: PROJECT_ID,
      location: LOCATION,
    };

    // Adiciona o caminho da chave SOMENTE se ele foi resolvido
    if (credentialsFilePath) {
      // CORREÇÃO CRÍTICA: O Next.js/Vertex SDK usa 'keyFile', não 'keyFilename'.
      vertexInit.keyFile = credentialsFilePath; 
    }

    const vertex_ai = new VertexAI(vertexInit);

    // Definição do Modelo
    const model = MODEL_NAME; 
    const generativeModel = vertex_ai.getGenerativeModel({ model });

    // Montagem da Requisição (Pronto para o SuperPrompt)
    const req = {
      contents: [{ role: 'user', parts: [{ text: promptParaIA }] }],
      systemInstruction: { parts: [{ text: superPrompt }] },
    };

    // 5. Execução e Tratamento da Resposta
    const result = await generativeModel.generateContent(req);
    const resultText = result.response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      return new NextResponse('Erro: A IA não retornou uma resposta válida ou foi bloqueada.', { status: 500 });
    }

    return new NextResponse(resultText, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error: any) {
    console.error("ERRO NO SERVIDOR (route.ts):", error);
    
    // Trata erros de autenticação ou modelo
    const errorMessage = error.message || String(error);
    
    return new NextResponse(`Erro: Falha na comunicação com o Vertex AI.\n\nDetalhes do Erro: ${errorMessage}`, { status: 500 });
  
  } finally {
    // Garante que o arquivo temporário do Base64 seja deletado após o uso (limpeza e segurança)
    if (credentialsFilePath && credentialsFilePath === TEMP_CREDENTIALS_FILE && fs.existsSync(TEMP_CREDENTIALS_FILE)) {
      try {
        fs.unlinkSync(TEMP_CREDENTIALS_FILE);
      } catch (e) {
        console.warn("Aviso de limpeza: Não foi possível deletar o arquivo temporário de credenciais.");
      }
    }
  }
}
