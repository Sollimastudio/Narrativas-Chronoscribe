import { NextRequest, NextResponse } from "next/server";
import { VertexAI } from "@google-cloud/vertexai";
import fs from "fs";
import os from "os";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { enforcePlanLimits } from "@/lib/usage";

const PROJECT_ID =
  process.env.GOOGLE_CLOUD_PROJECT || "chronoscribe-narratives";
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-1.5-pro";

const TEMP_CREDENTIALS_FILE = path.join(
  os.tmpdir(),
  `vertex-key-${process.pid}.json`
);

function resolveCredentialsFile(): string | undefined {
  const directPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (directPath) {
    return directPath;
  }

  const base64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
  if (!base64) {
    return undefined;
  }

  try {
    const decoded = Buffer.from(base64, "base64").toString("utf8");
    fs.writeFileSync(TEMP_CREDENTIALS_FILE, decoded, {
      encoding: "utf8",
      mode: 0o600,
    });
    return TEMP_CREDENTIALS_FILE;
  } catch (error) {
    console.error("[generate] falha ao criar arquivo de credenciais:", error);
    return undefined;
  }
}

type GenerateBody = {
  promptParaIA?: string;
  superPrompt?: string;
};

export async function POST(request: NextRequest) {
  const credentialsPath = resolveCredentialsFile();

  try {
    const session = await getServerSession(authOptions);
    const userId =
      session?.user && "id" in session.user
        ? ((session.user as { id?: string }).id ?? null)
        : null;

    if (!session || !userId) {
      return NextResponse.json(
        { error: "Autenticação necessária para gerar conteúdo." },
        { status: 401 }
      );
    }

    const { promptParaIA, superPrompt }: GenerateBody = await request.json();

    if (!promptParaIA || !promptParaIA.trim()) {
      return NextResponse.json(
        { error: "O campo promptParaIA é obrigatório." },
        { status: 400 }
      );
    }

    const limitCheck = await enforcePlanLimits(userId);
    if (!limitCheck.ok) {
      return NextResponse.json(
        { error: limitCheck.message, details: limitCheck.details },
        { status: limitCheck.status }
      );
    }

    const vertexOptions: {
      project: string;
      location: string;
      keyFile?: string;
    } = {
      project: PROJECT_ID,
      location: LOCATION,
    };

    if (credentialsPath) {
      vertexOptions.keyFile = credentialsPath;
    }

    const vertexAI = new VertexAI(vertexOptions);
    const generativeModel = vertexAI.getGenerativeModel({
      model: MODEL_NAME,
    });

    const req = {
      contents: [{ role: "user", parts: [{ text: promptParaIA }] }],
      systemInstruction: superPrompt
        ? { role: "system", parts: [{ text: superPrompt }] }
        : undefined,
    };

    const result = await generativeModel.generateContent(req);
    const resultText =
      result.response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      return NextResponse.json(
        {
          error:
            "A IA não retornou uma resposta válida. Ajuste o prompt e tente novamente.",
        },
        { status: 500 }
      );
    }

    await prisma.usageLog.create({
      data: {
        userId,
        type: "TEXT_GENERATION",
        promptId: MODEL_NAME,
      },
    });

    return new NextResponse(resultText, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8", "X-Vertex-Model": MODEL_NAME },
    });
  } catch (error) {
    console.error("[generate] erro geral:", error);
    const message =
      error instanceof Error ? error.message : "Falha desconhecida.";
    return NextResponse.json(
      {
        error:
          "Falha na comunicação com o Vertex AI. Verifique credenciais e tente novamente.",
        details: message,
      },
      { status: 500 }
    );
  } finally {
    if (
      credentialsPath &&
      credentialsPath === TEMP_CREDENTIALS_FILE &&
      fs.existsSync(TEMP_CREDENTIALS_FILE)
    ) {
      try {
        fs.unlinkSync(TEMP_CREDENTIALS_FILE);
      } catch {
        console.warn("[generate] não foi possível excluir arquivo temporário.");
      }
    }
  }
}
