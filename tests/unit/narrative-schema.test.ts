import test from "node:test";
import assert from "node:assert/strict";
import {
  validateBlueprint,
  validateGenerationContext,
} from "../../src/domain/narratives/schema";

const baseSections = [
  {
    id: "intro",
    title: "Abertura",
    objective: "Apresentar a promessa e capturar atenção.",
    highlights: ["Gancho forte", "Contexto rápido"],
  },
];

const baseBlueprint = {
  title: "Lançamento Chronoscribe",
  audience: "CMOs de empresas SaaS em crescimento",
  objective: "Converter leads em assinaturas do pacote Creator",
  medium: "text",
  tone: "visionary",
  lengthGuidance: "standard" as const,
  summary: "Narrativa para posicionar o Chronoscribe como solução definitiva.",
  sections: baseSections,
};

test("validateBlueprint aprova estrutura mínima válida", () => {
  const result = validateBlueprint(baseBlueprint);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.sections.length, 1);
    assert.equal(result.data.sections[0].highlights?.length, 2);
  }
});

test("validateBlueprint aponta campos obrigatórios ausentes", () => {
  const result = validateBlueprint({
    ...baseBlueprint,
    title: "",
    sections: [],
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    const fields = result.issues.map((issue) => issue.path);
    assert(fields.includes("title"));
    assert(fields.includes("sections"));
  }
});

test("validateGenerationContext exige blueprint coerente", () => {
  const result = validateGenerationContext({
    language: "pt-BR",
    format: "markdown",
    blueprint: {
      ...baseBlueprint,
      sections: [
        {
          id: "intro",
          title: "",
          objective: "",
          highlights: [],
        },
      ],
    },
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    const details = result.issues.map((issue) => issue.path);
    assert(
      details.some((path) => path.includes("blueprint.sections[0].title")),
      "Deveria apontar ausência de título da seção"
    );
  }
});
