import {
  NarrativeBlueprint,
  NarrativeGenerationContext,
  NarrativeMedium,
  BlueprintSection,
  NarrativeTone,
} from "@/domain/narratives/blueprint";

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ValidationSuccess<T> {
  ok: true;
  data: T;
}

export interface ValidationFailure {
  ok: false;
  issues: ValidationIssue[];
}

const allowedTones: NarrativeTone[] = [
  "visionary",
  "educational",
  "inspirational",
  "documentary",
  "sales",
];

const allowedMedia: NarrativeMedium[] = ["text", "script", "audio", "video"];

const LENGTH_GUARDRAILS = new Set(["short", "standard", "longform"]);

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function parseBooleanFlag(
  value: unknown,
  path: string,
  issues: ValidationIssue[]
): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) {
      return true;
    }
    if (["false", "0", "no", "off", ""].includes(normalized)) {
      return false;
    }
    issues.push({
      path,
      message: "Valor inválido. Use true/false, 1/0, yes/no ou on/off.",
    });
    return false;
  }

  if (value === undefined || value === null) {
    return false;
  }

  issues.push({
    path,
    message: "Informe um valor booleano.",
  });
  return false;
}

function parseOptionalPositiveInteger(
  value: unknown,
  path: string,
  issues: ValidationIssue[]
): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric < 1 || numeric > 10) {
    issues.push({
      path,
      message: "Informe um número inteiro entre 1 e 10.",
    });
    return undefined;
  }

  return numeric;
}

function parseStringList(value: unknown): string[] | undefined {
  if (value === undefined || value === null || value === "") {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => isNonEmptyString(item))
      .map((item) => item.trim());
  }

  if (typeof value === "string") {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return undefined;
}

function validateSections(sections: unknown): BlueprintSection[] {
  if (!Array.isArray(sections) || sections.length === 0) {
    throw {
      issues: [
        {
          path: "sections",
          message: "Forneça ao menos uma seção para a narrativa.",
        },
      ],
    };
  }

  const issues: ValidationIssue[] = [];
  const parsed: BlueprintSection[] = [];

  sections.forEach((value, index) => {
    if (typeof value !== "object" || !value) {
      issues.push({
        path: `sections[${index}]`,
        message: "Cada seção deve ser um objeto.",
      });
      return;
    }

    const section = value as Record<string, unknown>;
    const id = section.id;
    const title = section.title;
    const objective = section.objective;
    const highlights = section.highlights;

    if (!isNonEmptyString(id)) {
      issues.push({
        path: `sections[${index}].id`,
        message: "Forneça um identificador textual para a seção.",
      });
    }

    if (!isNonEmptyString(title)) {
      issues.push({
        path: `sections[${index}].title`,
        message: "Informe um título para a seção.",
      });
    }

    if (!isNonEmptyString(objective)) {
      issues.push({
        path: `sections[${index}].objective`,
        message: "Explique o objetivo narrativo da seção.",
      });
    }

    const parsedHighlights =
      Array.isArray(highlights) && highlights.length > 0
        ? highlights.filter((item): item is string => isNonEmptyString(item))
        : undefined;

    parsed.push({
      id: String(id),
      title: String(title),
      objective: String(objective),
      highlights: parsedHighlights,
    });
  });

  if (issues.length > 0) {
    throw { issues };
  }

  return parsed;
}

export function validateBlueprint(
  input: unknown
): ValidationSuccess<NarrativeBlueprint> | ValidationFailure {
  if (typeof input !== "object" || !input) {
    return {
      ok: false,
      issues: [
        { path: "blueprint", message: "Envie os dados da narrativa em JSON." },
      ],
    };
  }

  const data = input as Record<string, unknown>;
  const issues: ValidationIssue[] = [];

  const title = data.title;
  const audience = data.audience;
  const objective = data.objective;
  const medium = data.medium;
  const tone = data.tone;
  const lengthGuidance = data.lengthGuidance;
  const summary = data.summary;
  const callToAction = data.callToAction;
  const sections = data.sections;
  const linksURLs = data.linksURLs;
  const arquivosPDFs = data.arquivosPDFs;
  const arquivosMIdia = data.arquivosMIdia;
  const acaoDiretorArte = data.acaoDiretorArte;
  const acaoCritico = data.acaoCritico;
  const numImagensCarrossel = data.numImagensCarrossel;

  if (!isNonEmptyString(title)) {
    issues.push({ path: "title", message: "Informe um título para a narrativa." });
  }

  if (!isNonEmptyString(audience)) {
    issues.push({
      path: "audience",
      message: "Descreva o público-alvo com clareza.",
    });
  }

  if (!isNonEmptyString(objective)) {
    issues.push({
      path: "objective",
      message: "Explique o objetivo estratégico da narrativa.",
    });
  }

  if (!isNonEmptyString(summary) || summary.length < 24) {
    issues.push({
      path: "summary",
      message: "Traga um resumo com pelo menos 24 caracteres.",
    });
  }

  if (!isNonEmptyString(lengthGuidance) || !LENGTH_GUARDRAILS.has(lengthGuidance)) {
    issues.push({
      path: "lengthGuidance",
      message: "Escolha entre 'short', 'standard' ou 'longform'.",
    });
  }

  if (!isNonEmptyString(medium) || !allowedMedia.includes(medium as NarrativeMedium)) {
    issues.push({
      path: "medium",
      message: `Escolha um formato válido: ${allowedMedia.join(", ")}.`,
    });
  }

  if (!isNonEmptyString(tone) || !allowedTones.includes(tone as NarrativeTone)) {
    issues.push({
      path: "tone",
      message: `Escolha um tom válido: ${allowedTones.join(", ")}.`,
    });
  }

  if (callToAction && !isNonEmptyString(callToAction)) {
    issues.push({
      path: "callToAction",
      message: "Caso informe CTA, use uma string não vazia.",
    });
  }

  let parsedSections: BlueprintSection[] = [];
  if (!sections) {
    issues.push({
      path: "sections",
      message: "Inclua ao menos uma seção para estruturar a narrativa.",
    });
  } else {
    try {
      parsedSections = validateSections(sections);
    } catch (error) {
      const err = error as { issues?: ValidationIssue[] };
      if (err.issues) {
        issues.push(...err.issues);
      } else {
        issues.push({
          path: "sections",
          message: "Estrutura de seções inválida.",
        });
      }
    }
  }

  const parsedLinks = parseStringList(linksURLs);
  if (parsedLinks === undefined) {
    issues.push({
      path: "linksURLs",
      message: "Forneça os links como texto (um por linha) ou como lista de strings.",
    });
  }

  const parsedArquivosPDFs = isNonEmptyString(arquivosPDFs)
    ? String(arquivosPDFs).trim()
    : "";

  const parsedArquivosMidia = isNonEmptyString(arquivosMIdia)
    ? String(arquivosMIdia).trim()
    : "";

  const parsedAcaoDiretorArte = parseBooleanFlag(
    acaoDiretorArte,
    "acaoDiretorArte",
    issues
  );
  const parsedAcaoCritico = parseBooleanFlag(
    acaoCritico,
    "acaoCritico",
    issues
  );
  const parsedNumImagens = parseOptionalPositiveInteger(
    numImagensCarrossel,
    "numImagensCarrossel",
    issues
  );

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      title: String(title),
      audience: String(audience),
      objective: String(objective),
      medium: medium as NarrativeMedium,
      tone: tone as NarrativeTone,
      lengthGuidance: lengthGuidance as "short" | "standard" | "longform",
      summary: String(summary),
      callToAction: callToAction ? String(callToAction) : undefined,
      sections: parsedSections,
      linksURLs: parsedLinks ?? [],
      arquivosPDFs: parsedArquivosPDFs,
      arquivosMIdia: parsedArquivosMidia,
      acaoDiretorArte: parsedAcaoDiretorArte,
      acaoCritico: parsedAcaoCritico,
      numImagensCarrossel: parsedNumImagens,
    },
  };
}

export function validateGenerationContext(
  input: unknown
): ValidationSuccess<NarrativeGenerationContext> | ValidationFailure {
  if (typeof input !== "object" || !input) {
    return {
      ok: false,
      issues: [
        { path: "context", message: "Estrutura de contexto inválida." },
      ],
    };
  }

  const data = input as Record<string, unknown>;
  const issues: ValidationIssue[] = [];

  const language = data.language ?? "pt-BR";
  const format = data.format ?? "markdown";
  const brandVoice = data.brandVoice;
  const blueprint = data.blueprint;

  if (!["pt-BR", "en-US", "es-ES"].includes(String(language))) {
    issues.push({
      path: "language",
      message: "Idiomas suportados: pt-BR, en-US, es-ES.",
    });
  }

  if (!["markdown", "json", "text"].includes(String(format))) {
    issues.push({
      path: "format",
      message: "Formatos suportados: markdown, json, text.",
    });
  }

  if (brandVoice && typeof brandVoice !== "string") {
    issues.push({
      path: "brandVoice",
      message: "Caso informe brandVoice, forneça texto.",
    });
  }

  const blueprintResult = validateBlueprint(blueprint);
  if (!blueprintResult.ok) {
    issues.push(...blueprintResult.issues.map((issue) => ({
      path: `blueprint.${issue.path}`,
      message: issue.message,
    })));
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    data: {
      blueprint: blueprintResult.ok ? blueprintResult.data : (undefined as never),
      brandVoice: brandVoice ? String(brandVoice) : undefined,
      language: language as "pt-BR" | "en-US" | "es-ES",
      format: format as "markdown" | "json" | "text",
    },
  };
}
