'use client';

import React, { useEffect, useState } from 'react';
import { ContentAnalyzer } from './ContentAnalyzer';

// Helper types
type UploadResult = { url: string; name: string };

// Step 1 - Upload e URLs
const StepUpload = ({ onNext, onData }: { onNext: () => void; onData: (v: { files: UploadResult[]; urls: string[]; combinedText?: string }) => void }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [urls, setUrls] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setStatus(null);
    }
  };

  async function uploadAll(): Promise<{ uploaded: UploadResult[]; combinedText: string }> {
    if (files.length === 0) return { uploaded: [], combinedText: '' };
    setStatus('Enviando arquivos...');
    const formData = new FormData();
    for (const f of files) formData.append('file', f);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Falha no upload');
    const data = await res.json();
    const list: UploadResult[] = Array.isArray(data.files)
      ? data.files.map((x: any) => ({ url: x.url, name: x.name || x.originalName }))
      : [{ url: data.url ?? data.success ? data.url : '', name: data.name ?? '' }].filter((x) => x.url);
    const combinedText: string = (data.extractedCombinedText as string) || '';
    return { uploaded: list, combinedText };
  }

  async function ingestUrls(): Promise<string> {
    const list = urls
      .split(/\s|,|;|\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (list.length === 0) return '';
    setStatus('Coletando conteúdo dos links...');
    const res = await fetch('/api/ingest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: list }),
    });
    if (!res.ok) throw new Error('Falha ao coletar links');
    const data = await res.json();
    return data.content ?? '';
  }

  const handleProcess = async () => {
    setProcessing(true);
    setStatus(null);
    try {
      const [{ uploaded, combinedText }, combinedFromUrls] = await Promise.all([uploadAll(), ingestUrls()]);
      const finalCombined = [combinedText, combinedFromUrls].filter(Boolean).join('\n\n').trim();
      onData({ files: uploaded, urls: urls.split(/\s|,|;|\n/).filter(Boolean), combinedText: finalCombined });
      setStatus('Pronto.');
    } catch (err: any) {
      setStatus(err.message || 'Erro ao processar');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Passo 1: Upload de Arquivos e Links</h2>
      <p className="mb-4">Envie documentos (PDF, DOCX, imagens) e/ou cole links (sites, PDFs, DOCX).</p>

      <div className="space-y-3">
        <input type="file" onChange={handleAddFiles} multiple className="mb-2" />
        <textarea
          className="w-full rounded-md bg-slate-900 border border-slate-700 p-3 text-sm"
          rows={3}
          placeholder="Cole aqui links (separados por espaço, vírgula ou quebra de linha)"
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
        />
        <div className="flex gap-3">
          <button onClick={handleProcess} disabled={processing} className="px-4 py-2 bg-blue-600 text-white rounded-md">
            Processar
          </button>
          <button onClick={onNext} disabled={processing} className="px-4 py-2 bg-amber-400 text-slate-900 rounded-md">
            Próximo
          </button>
        </div>
        {status && <p className="text-sm text-slate-300">{status}</p>}
      </div>
    </div>
  );
};

const StepContentChoice = ({ onNext, onPrevious, combinedText, onSelect }: { onNext: () => void; onPrevious: () => void; combinedText?: string; onSelect: (text: string) => void }) => {
  const [text, setText] = useState<string>(combinedText || '');
  useEffect(() => {
    setText(combinedText || '');
  }, [combinedText]);

  const count = text.trim().length;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Passo 2: Escolha de Conteúdo</h2>
      <p className="mb-3">Revise e selecione o conteúdo que deseja usar. Você pode editar abaixo.</p>
      <textarea
        className="w-full min-h-[220px] rounded-md bg-slate-900 border border-slate-700 p-3 text-sm"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
        <span>{count} caracteres</span>
        <span>Dica: mantenha apenas o essencial para uma análise mais precisa.</span>
      </div>
      <div className="mt-4">
        <button onClick={onPrevious} className="mr-2 px-6 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors">
          Anterior
        </button>
        <button
          onClick={() => {
            onSelect(text);
            onNext();
          }}
          className="px-6 py-2 bg-yellow-500 text-blue-900 font-bold rounded-lg shadow-md hover:bg-yellow-400 transition-colors"
        >
          Próximo
        </button>
      </div>
    </div>
  );
};

const StepObjective = ({ onNext, onPrevious, onSet }: { onNext: () => void; onPrevious: () => void; onSet: (v: string) => void }) => {
  const [obj, setObj] = useState('');
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Passo 3: Defina o Objetivo</h2>
      <input
        className="w-full rounded-md bg-slate-900 border border-slate-700 p-3 text-sm"
        placeholder="Ex.: gerar um resumo executivo para apresentação"
        value={obj}
        onChange={(e) => setObj(e.target.value)}
      />
      <div className="mt-4">
        <button onClick={onPrevious} className="mr-2 px-6 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors">
          Anterior
        </button>
        <button onClick={() => { onSet(obj); onNext(); }} className="px-6 py-2 bg-yellow-500 text-blue-900 font-bold rounded-lg shadow-md hover:bg-yellow-400 transition-colors">
          Próximo
        </button>
      </div>
    </div>
  );
};

const StepStyle = ({ onNext, onPrevious, onSet }: { onNext: () => void; onPrevious: () => void; onSet: (v: string) => void }) => {
  const [style, setStyle] = useState('general');
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Passo 4: Escolha o Estilo</h2>
      <select
        className="w-full rounded-md bg-slate-900 border border-slate-700 p-3 text-sm"
        value={style}
        onChange={(e) => setStyle(e.target.value)}
      >
        <option value="general">Geral</option>
        <option value="academic">Acadêmico</option>
        <option value="executive">Executivo</option>
        <option value="storytelling">Storytelling</option>
      </select>
      <div className="mt-4">
        <button onClick={onPrevious} className="mr-2 px-6 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors">
          Anterior
        </button>
        <button onClick={() => { onSet(style); onNext(); }} className="px-6 py-2 bg-yellow-500 text-blue-900 font-bold rounded-lg shadow-md hover:bg-yellow-400 transition-colors">
          Próximo
        </button>
      </div>
    </div>
  );
};

const StepCriticalAnalysis = ({ onNext, onPrevious, content, format, style, onDone }: { onNext: () => void; onPrevious: () => void; content: string; format: string; style: string; onDone: () => void }) => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Passo 5: Análise Crítica</h2>
    <ContentAnalyzer
      content={content}
      format={format}
      style={style}
      onAnalysisComplete={() => {
        onDone();
        onNext();
      }}
    />
    <button onClick={onPrevious} className="mt-4 mr-2 px-6 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors">
      Anterior
    </button>
  </div>
);

const StepArt = ({ onNext, onPrevious }: { onNext: () => void; onPrevious: () => void }) => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Passo 6: Geração de Arte</h2>
    <p>Crie imagens e outros elementos visuais para sua narrativa.</p>
    <button onClick={onPrevious} className="mt-4 mr-2 px-6 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors">Anterior</button>
    <button onClick={onNext} className="mt-4 px-6 py-2 bg-yellow-500 text-blue-900 font-bold rounded-lg shadow-md hover:bg-yellow-400 transition-colors">Próximo</button>
  </div>
);

const StepGeneration = ({ onNext, onPrevious }: { onNext: () => void; onPrevious: () => void }) => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Passo 7: Geração da Narrativa</h2>
    <p>Gere a narrativa final com base nas suas escolhas.</p>
    <button onClick={onPrevious} className="mt-4 mr-2 px-6 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors">Anterior</button>
    <button onClick={onNext} className="mt-4 px-6 py-2 bg-yellow-500 text-blue-900 font-bold rounded-lg shadow-md hover:bg-yellow-400 transition-colors">Próximo</button>
  </div>
);

const StepExport = ({ onNext, onPrevious }: { onNext: () => void; onPrevious: () => void }) => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Passo 8: Exportação</h2>
    <p>Exporte sua narrativa em diferentes formatos (PDF, EPUB, etc.).</p>
    <button onClick={onPrevious} className="mt-4 mr-2 px-6 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors">Anterior</button>
    <button onClick={onNext} className="mt-4 px-6 py-2 bg-yellow-500 text-blue-900 font-bold rounded-lg shadow-md hover:bg-yellow-400 transition-colors">Próximo</button>
  </div>
);

const StepReuse = ({ onPrevious }: { onPrevious: () => void }) => (
  <div>
    <h2 className="text-2xl font-bold mb-4">Passo 9: Reutilização</h2>
    <p>Reutilize e adapte sua narrativa para novos contextos.</p>
    <button onClick={onPrevious} className="mt-4 mr-2 px-6 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors">Anterior</button>
  </div>
);

const steps = [
  'Upload',
  'Conteúdo',
  'Objetivo',
  'Estilo',
  'Análise',
  'Arte',
  'Geração',
  'Exportação',
  'Reutilização',
];

const ContentCreator: React.FC = () => {
  const [step, setStep] = useState(1);
  const [ingested, setIngested] = useState<{ files: UploadResult[]; urls: string[]; combinedText?: string } | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  const [objective, setObjective] = useState<string>('');
  const [style, setStyle] = useState<string>('general');

  useEffect(() => {
    if (ingested?.combinedText) {
      setSelectedText(ingested.combinedText);
    }
  }, [ingested?.combinedText]);

  const nextStep = () => setStep((prev) => (prev < 9 ? prev + 1 : prev));
  const prevStep = () => setStep((prev) => (prev > 1 ? prev - 1 : prev));
  const goToStep = (stepNumber: number) => setStep(stepNumber);

  const renderStep = () => {
    switch (step) {
      case 1:
        return <StepUpload onNext={nextStep} onData={setIngested} />;
      case 2:
        return (
          <StepContentChoice
            onNext={nextStep}
            onPrevious={prevStep}
            combinedText={ingested?.combinedText}
            onSelect={setSelectedText}
          />
        );
      case 3:
        return <StepObjective onNext={nextStep} onPrevious={prevStep} onSet={setObjective} />;
      case 4:
        return <StepStyle onNext={nextStep} onPrevious={prevStep} onSet={setStyle} />;
      case 5:
        return (
          <StepCriticalAnalysis
            onNext={nextStep}
            onPrevious={prevStep}
            content={selectedText || ingested?.combinedText || ''}
            format={objective || 'text'}
            style={style || 'general'}
            onDone={() => {}}
          />
        );
      case 6:
        return <StepArt onNext={nextStep} onPrevious={prevStep} />;
      case 7:
        return <StepGeneration onNext={nextStep} onPrevious={prevStep} />;
      case 8:
        return <StepExport onNext={nextStep} onPrevious={prevStep} />;
      case 9:
        return <StepReuse onPrevious={prevStep} />;
      default:
        return <StepUpload onNext={nextStep} onData={setIngested} />;
    }
  };

  return (
    <div className="w-full max-w-5xl rounded-3xl border border-slate-800/60 bg-slate-950/70 px-6 py-8 text-slate-100 shadow-2xl shadow-blue-900/20 backdrop-blur-md sm:px-10 sm:py-10">
      <div className="mb-10 space-y-2 text-center">
        <h1 className="text-3xl font-bold text-amber-100 sm:text-4xl">Arquiteto Mestre Escriba</h1>
        <p className="text-sm text-slate-300 sm:text-base">Percorra a jornada estratégica do Meta-agente L5 para destravar narrativas épicas.</p>
      </div>

      <div className="mb-10 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
        <div className="flex w-full items-center justify-between gap-2">
          {steps.map((name, index) => {
            const completed = step > index + 1;
            const current = step === index + 1;
            return (
              <React.Fragment key={name}>
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => goToStep(index + 1)}
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                      completed
                        ? 'bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/30'
                        : current
                        ? 'bg-amber-300 text-slate-950 shadow-lg shadow-amber-300/30'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                  <span className="mt-2 text-[11px] text-slate-400">{name}</span>
                </div>
                {index < steps.length - 1 && <div className="mx-1 h-[2px] flex-1 rounded-full bg-slate-800" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="min-h-[320px] rounded-2xl border border-slate-800/60 bg-slate-900/50 p-6 shadow-inner shadow-slate-950/40">{renderStep()}</div>
    </div>
  );
}

export { ContentCreator };
export default ContentCreator;
