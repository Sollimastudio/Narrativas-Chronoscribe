import { NextResponse } from "next/server";
import { VertexAI } from "@google-cloud/vertexai";

type GenerateBody = {
  superPrompt?: string;
  promptParaIA?: string;
};

const DEFAULT_MODEL = "gemini-1.5-pro";
const DEFAULT_LOCATION = "us-central1";
const FALLBACK_MODEL = "gemini-pro";

function extractErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const maybe = (error as { message?: unknown }).message;
    if (typeof maybe === "string") return maybe;
  }
  return "Falha desconhecida.";
}

function isModelMissing(error: unknown) {
  const message = extractErrorMessage(error);
  const code = (error as { code?: unknown }).code;
  const status = (error as { status?: unknown }).status;
  return (
    message.includes("NOT_FOUND") ||
    message.includes('"code":404') ||
    message.includes("status obtido: 404") ||
    code === 404 ||
    code === "NOT_FOUND" ||
    status === 404 ||
    status === "NOT_FOUND"
  );
}

async function runGeneration(opts: {
  vertexAI: VertexAI;
  model: string;
  promptParaIA: string;
  superPrompt?: string;
}) {
  const { vertexAI, model, promptParaIA, superPrompt } = opts;

  const generativeModel = vertexAI.getGenerativeModel({
    model,
    generationConfig: {
      temperature: 0.65,
      topP: 0.9,
      topK: 32,
      maxOutputTokens: 2048,
    },
  });

  const response = await generativeModel.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: promptParaIA }],
      },
    ],
    systemInstruction: superPrompt
      ? {
          role: "system",
          parts: [{ text: superPrompt }],
        }
      : undefined,
  });

  const text =
    response.response.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (!text) {
    throw new Error(
      "A IA não retornou conteúdo textual. Ajuste o prompt ou tente novamente."
    );
  }

  return { text, modelUsed: model };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateBody;
    const { superPrompt, promptParaIA } = body;

    if (!promptParaIA || !promptParaIA.trim()) {
      return NextResponse.json(
        { error: "O campo promptParaIA é obrigatório." },
        { status: 400 }
      );
    }

    const projectId =
      process.env.GOOGLE_CLOUD_PROJECT ??
      process.env.GCLOUD_PROJECT ??
      process.env.GOOGLE_PROJECT_ID ??
      "";

    if (!projectId) {
      return NextResponse.json(
        {
          error:
            "Variável de ambiente GOOGLE_CLOUD_PROJECT (ou GCLOUD_PROJECT) não configurada.",
        },
        { status: 500 }
      );
    }

    const location = process.env.GOOGLE_CLOUD_LOCATION ?? DEFAULT_LOCATION;
    const primaryModel = process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
    const fallbackModel =
      process.env.GEMINI_FALLBACK_MODEL ?? FALLBACK_MODEL;

    const vertexAI = new VertexAI({
      project: projectId,
      location,
    });

    let generation;
    try {
      generation = await runGeneration({
        vertexAI,
        model: primaryModel,
        promptParaIA,
        superPrompt,
      });
    } catch (primaryError) {
      if (
        isModelMissing(primaryError) &&
        primaryModel.trim() !== fallbackModel.trim()
      ) {
        console.warn(
          `[generate] modelo ${primaryModel} indisponível. Tentando fallback ${fallbackModel}.`
        );
        generation = await runGeneration({
          vertexAI,
          model: fallbackModel,
          promptParaIA,
          superPrompt,
        });
      } else {
        throw primaryError;
      }
    }

    return new Response(generation.text, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Vertex-Model": generation.modelUsed,
      },
    });
  } catch (error: unknown) {
    console.error("[generate] erro ao chamar Vertex AI:", error);

    const message = extractErrorMessage(error);

    const authHints = [
      "Unable to authenticate your request",
      "Could not load the default credentials",
      "The Application Default Credentials are not available",
    ];

    if (authHints.some((hint) => message.includes(hint))) {
      return NextResponse.json(
        {
          error:
            "Credenciais do Google Cloud ausentes ou inválidas. Faça login com o gcloud ou informe o caminho do arquivo JSON do serviço (GOOGLE_APPLICATION_CREDENTIALS).",
          details: message,
        },
        { status: 401 }
      );
    }

    if (isModelMissing(error)) {
      return NextResponse.json(
        {
          error:
            "Modelo Gemini informado não está disponível para este projeto/região.",
          details: "Verifique o nome do modelo no Vertex AI Model Garden.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Não foi possível gerar a resposta com o Vertex AI. Verifique as credenciais e tente novamente.",
        details: message,
      },
      { status: 500 }
    );
  }
}
