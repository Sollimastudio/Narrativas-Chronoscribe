"use client";

import { useState, useEffect, type CSSProperties } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { FiUpload, FiFile, FiX } from "react-icons/fi";

type SectionForm = {
  id: string;
  title: string;
  objective: string;
  highlights: string;
};

interface UsageSnapshot {
  plan: {
    name: string;
    dailyGenerationsLimit?: number | null;
    monthlyGenerationsLimit?: number | null;
  };
  usage: {
    dailyCount: number;
    monthlyCount: number;
    dailyLimit?: number | null;
    monthlyLimit?: number | null;
  };
}

interface GenerationResult {
  content: string;
  createdAt: string;
  promptTokens?: number;
  completionTokens?: number;
  analisePreditiva?: {
    sugestoesCriticas: string;
    sugestoesViralizacao: string;
  };
  promptImagem?: string;
  promptCarrossel?: string[];
}

const defaultSections: SectionForm[] = [
  {
    id: "opening",
    title: "Abertura magnética",
    objective: "Apresentar a ideia central e a promessa da narrativa.",
    highlights: "Gancho poderoso; Contextualização do problema.",
  },
  {
    id: "core",
    title: "Desenvolvimento estratégico",
    objective:
      "Explorar argumentos-chave, histórias e provas sociais que sustentam a promessa.",
    highlights: "3 pontos de suporte; Dados ou evidências; Voz da marca.",
  },
  {
    id: "closing",
    title: "Encerramento e convocação",
    objective:
      "Conduzir à ação, reforçando benefícios e próximo passo claro.",
    highlights: "Resumo forte; CTA único; Urgência ou escassez.",
  },
];

const dramaAutoralSections: SectionForm[] = [
  {
    id: "gatilhoVisceral",
    title: "Gatilho Visceral",
    objective: "Iniciar com um momento de alto impacto emocional que define o tom da narrativa.",
    highlights: "Momento crucial; Tensão máxima; Sensações físicas; Emoções cruas.",
  },
  {
    id: "contextoDramatico",
    title: "Contexto Dramático",
    objective: "Estabelecer o cenário e as circunstâncias que levaram ao momento inicial.",
    highlights: "Ambiente; Época; Personagens-chave; Conflitos internos.",
  },
  {
    id: "ascensaoTensao",
    title: "Ascensão da Tensão",
    objective: "Construir gradualmente a intensidade emocional através de eventos significativos.",
    highlights: "Sequência de eventos; Pontos de virada; Revelações pessoais.",
  },
  {
    id: "climaxVisceral",
    title: "Clímax Visceral",
    objective: "Atingir o ponto máximo de tensão emocional e transformação pessoal.",
    highlights: "Momento decisivo; Confronto interno; Superação; Catarse.",
  },
  {
    id: "ressonancia",
    title: "Ressonância e Reflexão",
    objective: "Explorar o impacto e significado das transformações vividas.",
    highlights: "Lições aprendidas; Cicatrizes emocionais; Crescimento pessoal.",
  }
];

function parseListInput(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

export function NarrativeComposer() {
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState("");
  const [objective, setObjective] = useState("");
  const [summary, setSummary] = useState("");
  const [tone, setTone] = useState("visionary");
  const [medium, setMedium] = useState("text");
  const [lengthGuidance, setLengthGuidance] = useState("standard");
  const [callToAction, setCallToAction] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [language, setLanguage] = useState("pt-BR");
  const [format, setFormat] = useState("markdown");
  const [sections, setSections] = useState<SectionForm[]>(defaultSections);
  const [linkReferences, setLinkReferences] = useState("");
  const [pdfReferences, setPdfReferences] = useState("");
  const [mediaReferences, setMediaReferences] = useState("");
  const [carrosselSlides, setCarrosselSlides] = useState("");

  const [acaoCritico, setAcaoCritico] = useState(false);
  const [acaoDiretorArte, setAcaoDiretorArte] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [usage, setUsage] = useState<UsageSnapshot | null>(null);

  const [files, setFiles] = useState<File[]>([]);
  
  const onDrop = (acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    }
  });

  useEffect(() => {
    let isMounted = true;

    async function loadUsage() {
      try {
        const response = await fetch("/api/usage");
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as UsageSnapshot;
        if (isMounted) {
          setUsage(payload);
        }
      } catch (err) {
        console.warn("Falha ao carregar limites de uso:", err);
      }
    }

    loadUsage();
    const interval = setInterval(loadUsage, 60_000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  function updateSection(index: number, field: keyof SectionForm, value: string) {
    setSections((current) =>
      current.map((section, idx) =>
        idx === index ? { ...section, [field]: value } : section
      )
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResult(null);

    if (!title || !audience || !objective || !summary) {
      setError("Preencha título, público, objetivo e resumo.");
      return;
    }

    const linksList = parseListInput(linkReferences);
    const pdfContext = pdfReferences.trim();
    const mediaContext = mediaReferences.trim();
    const carrosselValue = carrosselSlides.trim();
    const parsedCarrossel =
      acaoDiretorArte && carrosselValue.length > 0
        ? Number(carrosselValue)
        : undefined;

    if (
      acaoDiretorArte &&
      carrosselValue.length > 0 &&
      (Number.isNaN(parsedCarrossel) ||
        !Number.isInteger(parsedCarrossel as number) ||
        (parsedCarrossel ?? 0) < 1 ||
        (parsedCarrossel ?? 0) > 10)
    ) {
      setError("Número de imagens do carrossel deve ser um inteiro entre 1 e 10.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        language,
        format,
        brandVoice: brandVoice.trim() || undefined,
        blueprint: {
          title,
          audience,
          objective,
          summary,
          tone,
          medium,
          lengthGuidance,
          callToAction: callToAction.trim() || undefined,
          sections: sections.map((section) => ({
            id: section.id,
            title: section.title,
            objective: section.objective,
            highlights: section.highlights
              .split("\n")
              .flatMap((line) =>
                line
                  .split(";")
                  .map((item) => item.trim())
                  .filter(Boolean)
              ),
          })),
          linksURLs: linksList,
          arquivosPDFs: pdfContext,
          arquivosMIdia: mediaContext,
          acaoCritico,
          acaoDiretorArte,
          numImagensCarrossel: parsedCarrossel,
        },
      };

      const response = await fetch("/api/narratives", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error ?? "Não foi possível gerar a narrativa.");
        return;
      }

      setResult(data as GenerationResult);
    } catch (err) {
      console.error("Falha ao gerar narrativa:", err);
      setError("Erro inesperado. Tente novamente em instantes.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-amber-500"
        >
          Compositor de Drama Biográfico
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-8"
        >
          {/* Upload Area */}
          <div 
            {...getRootProps()} 
            className={`
              relative p-12 border-2 border-dashed rounded-xl 
              ${isDragActive ? 'border-yellow-400 bg-yellow-400/10' : 'border-gray-600 hover:border-yellow-400/50'}
              transition-all duration-300 cursor-pointer
              group shadow-2xl hover:shadow-yellow-400/20
            `}
          >
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center space-y-4 text-center">
              <motion.div 
                animate={{ scale: isDragActive ? 1.1 : 1 }}
                className="p-4 rounded-full bg-yellow-400/20 text-yellow-400 shadow-lg shadow-yellow-400/30"
              >
                <FiUpload size={32} />
              </motion.div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-yellow-400">
                  {isDragActive ? 'Solte seus arquivos aqui' : 'Upload de Documentos'}
                </h3>
                <p className="text-gray-400">
                  Arraste PDFs aqui ou clique para selecionar
                </p>
              </div>
            </div>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-medium text-yellow-400">
                Arquivos carregados
              </h3>
              
              <div className="space-y-3">
                {files.map((file, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 group hover:bg-gray-800 shadow-lg hover:shadow-yellow-400/10"
                  >
                    <div className="flex items-center space-x-3">
                      <FiFile className="text-yellow-400" size={20} />
                      <span className="text-gray-200">{file.name}</span>
                      <span className="text-gray-500 text-sm">
                        ({Math.round(file.size / 1024)} KB)
                      </span>
                    </div>
                    
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 rounded-full hover:bg-red-500/20 text-red-400"
                    >
                      <FiX size={18} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          {files.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-end space-x-4"
            >
              <button
                onClick={() => setFiles([])}
                className="px-6 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors shadow-lg hover:shadow-red-400/20"
              >
                Limpar
              </button>
              
              <button
                onClick={() => {/* Implementar análise */}}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-medium hover:from-yellow-300 hover:to-amber-400 transition-colors shadow-lg hover:shadow-yellow-400/30"
              >
                Analisar Documentos
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

const usageStyle: CSSProperties = {
  display: "flex",
  gap: "1.5rem",
  flexWrap: "wrap",
  padding: "1rem 1.5rem",
  borderRadius: "18px",
  border: "1px solid rgba(56,189,248,0.35)",
  background:
    "linear-gradient(135deg, rgba(30,58,138,0.55), rgba(14,165,233,0.25))",
  fontWeight: 600,
};

const formStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
  padding: "2.5rem",
  borderRadius: "24px",
  backgroundColor: "rgba(15, 23, 42, 0.92)",
  border: "1px solid rgba(148, 163, 184, 0.35)",
  boxShadow: "0px 35px 80px rgba(14,116,144,0.35)",
};

const fieldGrid: CSSProperties = {
  display: "grid",
  gap: "1.5rem",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
};

const labelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.4rem",
  fontWeight: 600,
};

const labelStyleFull: CSSProperties = {
  ...labelStyle,
  gridColumn: "1 / -1",
};

const inputStyle: CSSProperties = {
  padding: "0.85rem 1rem",
  borderRadius: "12px",
  border: "1px solid rgba(148, 163, 184, 0.35)",
  backgroundColor: "rgba(15, 23, 42, 0.7)",
  color: "#e2e8f0",
  outline: "none",
};

const textareaStyle: CSSProperties = {
  ...inputStyle,
  resize: "vertical",
};

const sectionCard: CSSProperties = {
  borderRadius: "18px",
  border: "1px solid rgba(148, 163, 184, 0.25)",
  padding: "1.5rem",
  display: "grid",
  gap: "1rem",
  backgroundColor: "rgba(15, 23, 42, 0.7)",
};

const errorStyle: CSSProperties = {
  borderRadius: "14px",
  border: "1px solid rgba(248,113,113,0.6)",
  padding: "1rem 1.2rem",
  backgroundColor: "rgba(248,113,113,0.1)",
  fontWeight: 600,
};

function submitStyle(disabled: boolean): CSSProperties {
  return {
    padding: "1rem 1.2rem",
    borderRadius: "16px",
    border: "none",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.7 : 1,
    color: "#0f172a",
    background:
      "linear-gradient(135deg, rgba(34,211,238,0.95), rgba(14,165,233,0.95))",
    boxShadow: "0px 25px 60px rgba(59,130,246,0.35)",
  };
}

function toggleButtonStyle(active: boolean): CSSProperties {
  return {
    padding: "0.8rem 1.2rem",
    borderRadius: "14px",
    border: `1px solid ${active ? 'rgba(34,211,238,0.8)' : 'rgba(148, 163, 184, 0.35)'}`,
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: "pointer",
    color: active ? '#e2e8f0' : '#a3a3a3',
    backgroundColor: active ? 'rgba(34,211,238,0.2)' : 'transparent',
  };
}

const resultStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
  padding: "2.5rem",
  borderRadius: "24px",
  border: "1px solid rgba(148,163,184,0.35)",
  backgroundColor: "rgba(15, 23, 42, 0.95)",
  boxShadow: "0px 35px 90px rgba(79,70,229,0.35)",
};

const subResultStyle: CSSProperties = {
  backgroundColor: "rgba(15, 23, 42, 0.8)",
  borderRadius: "16px",
  padding: "1.5rem",
  border: "1px solid rgba(148, 163, 184, 0.25)",
};
