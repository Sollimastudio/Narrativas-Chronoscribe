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

const StepContentChoice = ({ onNext, onPrevious, combinedText, onSelect, onTypeSelect }: { onNext: () => void; onPrevious: () => void; combinedText?: string; onSelect: (text: string) => void; onTypeSelect: (type: string) => void }) => {
  const [text, setText] = useState<string>(combinedText || '');
  const [contentType, setContentType] = useState<string>('livro');
  
  useEffect(() => {
    setText(combinedText || '');
  }, [combinedText]);

  const count = text.trim().length;

  const contentTypes = [
    { value: 'livro', label: 'Livro (250-300 páginas)', desc: 'Narrativa completa com capítulos e estrutura profunda' },
    { value: 'ebook', label: 'E-book', desc: 'Material de autoridade focado em conversão e leads' },
    { value: 'carrossel', label: 'Carrossel / Funil Visual', desc: 'Sequência de slides com headlines poderosas' },
    { value: 'mentoria', label: 'Mentoria / Programa', desc: 'Módulos, exercícios e frameworks estruturados' },
    { value: 'vsl', label: 'VSL (Video Sales Letter)', desc: 'Roteiro persuasivo para vídeo de vendas' },
    { value: 'video-longo', label: 'Vídeo Longo (YouTube)', desc: 'Conteúdo educacional com capítulos e timestamps' },
    { value: 'post', label: 'Post', desc: 'Post de blog ou social media otimizado' },
    { value: 'artigo', label: 'Artigo', desc: 'Artigo de autoridade com SEO' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Passo 2: Tipo de Conteúdo</h2>
      <p className="mb-3">Escolha o tipo de conteúdo que deseja criar e revise o material base.</p>
      
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2 text-amber-100">Tipo de Conteúdo:</label>
        <select
          className="w-full rounded-md bg-slate-900 border border-slate-700 p-3 text-sm"
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
        >
          {contentTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-400">
          {contentTypes.find((t) => t.value === contentType)?.desc}
        </p>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2 text-amber-100">Material Base:</label>
        <textarea
          className="w-full min-h-[220px] rounded-md bg-slate-900 border border-slate-700 p-3 text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Edite ou refine o conteúdo extraído dos seus arquivos..."
        />
        <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
          <span>{count} caracteres</span>
          <span>Dica: mantenha apenas o essencial para melhor resultado.</span>
        </div>
      </div>

      <div className="mt-4">
        <button onClick={onPrevious} className="mr-2 px-6 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors">
          Anterior
        </button>
        <button
          onClick={() => {
            onSelect(text);
            onTypeSelect(contentType);
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

const StepObjective = ({ onNext, onPrevious, onSet }: { onNext: () => void; onPrevious: () => void; onSet: (v: string[]) => void }) => {
  const [objectives, setObjectives] = useState<string[]>(['vendas']);
  
  const availableObjectives = [
    { value: 'vendas', label: 'Vendas', desc: 'Construir desejo irresistível e urgência' },
    { value: 'engajamento', label: 'Engajamento', desc: 'Conexão emocional e interação' },
    { value: 'crescimento', label: 'Crescimento', desc: 'Viralização e alcance' },
    { value: 'reconhecimento', label: 'Reconhecimento', desc: 'Autoridade e thought leadership' },
    { value: 'lancamento', label: 'Lançamento', desc: 'Antecipação e FOMO' },
    { value: 'autoridade', label: 'Autoridade', desc: 'Expertise e frameworks únicos' },
    { value: 'leads', label: 'Leads', desc: 'Captura de contatos qualificados' },
  ];

  const toggleObjective = (value: string) => {
    if (objectives.includes(value)) {
      setObjectives(objectives.filter((o) => o !== value));
    } else {
      setObjectives([...objectives, value]);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Passo 3: Objetivos de Conversão</h2>
      <p className="mb-3">Selecione um ou mais objetivos (o que você quer alcançar com este conteúdo):</p>
      
      <div className="space-y-2 mb-4">
        {availableObjectives.map((obj) => (
          <label
            key={obj.value}
            className={`flex items-start p-3 rounded-md border cursor-pointer transition-all ${
              objectives.includes(obj.value)
                ? 'bg-amber-400/20 border-amber-400'
                : 'bg-slate-900 border-slate-700 hover:border-slate-600'
            }`}
          >
            <input
              type="checkbox"
              checked={objectives.includes(obj.value)}
              onChange={() => toggleObjective(obj.value)}
              className="mt-1 mr-3"
            />
            <div className="flex-1">
              <div className="font-semibold text-sm">{obj.label}</div>
              <div className="text-xs text-slate-400">{obj.desc}</div>
            </div>
          </label>
        ))}
      </div>

      <div className="mt-4">
        <button onClick={onPrevious} className="mr-2 px-6 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors">
          Anterior
        </button>
        <button 
          onClick={() => { 
            onSet(objectives.length > 0 ? objectives : ['vendas']); 
            onNext(); 
          }} 
          disabled={objectives.length === 0}
          className="px-6 py-2 bg-yellow-500 text-blue-900 font-bold rounded-lg shadow-md hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próximo
        </button>
      </div>
    </div>
  );
};

const StepStyle = ({ onNext, onPrevious, onSet }: { onNext: () => void; onPrevious: () => void; onSet: (v: string) => void }) => {
  const [style, setStyle] = useState('montanha-russa');
  
  const styles = [
    { value: 'montanha-russa', label: 'Montanha-Russa da Viralidade', desc: 'Tensão extrema + alívio catártico. Quebras de padrão constantes. IMPOSSÍVEL DE IGNORAR.' },
    { value: 'executivo', label: 'Executivo Estratégico', desc: 'Autoridade sem arrogância. Dados concretos. Frameworks claros e ROI visível.' },
    { value: 'poetico', label: 'Poético Metafórico', desc: 'Metáforas sensoriais poderosas. Imagens mentais vívidas. Apelo emocional profundo.' },
    { value: 'academico', label: 'Acadêmico Fundamentado', desc: 'Base em pesquisas. Argumentação lógica impecável. Credibilidade através de fontes.' },
    { value: 'storytelling', label: 'Storytelling Narrativo', desc: 'Jornada do Herói. Arcos emocionais completos. "Mostre, não conte".' },
    { value: 'visceral', label: 'Visceral Provocativo', desc: 'Linguagem que atinge o corpo. Confronta crenças. Vulnerabilidade radical como poder.' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Passo 4: Estilo Narrativo</h2>
      <p className="mb-3">Escolha o estilo de escrita que melhor se alinha com sua mensagem:</p>
      
      <div className="space-y-2 mb-4">
        {styles.map((s) => (
          <label
            key={s.value}
            className={`flex items-start p-3 rounded-md border cursor-pointer transition-all ${
              style === s.value
                ? 'bg-amber-400/20 border-amber-400'
                : 'bg-slate-900 border-slate-700 hover:border-slate-600'
            }`}
          >
            <input
              type="radio"
              name="style"
              value={s.value}
              checked={style === s.value}
              onChange={(e) => setStyle(e.target.value)}
              className="mt-1 mr-3"
            />
            <div className="flex-1">
              <div className="font-semibold text-sm">{s.label}</div>
              <div className="text-xs text-slate-400">{s.desc}</div>
            </div>
          </label>
        ))}
      </div>

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

const StepArt = ({ onNext, onPrevious, contentType, contentSummary }: { onNext: () => void; onPrevious: () => void; contentType: string; contentSummary: string }) => {
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [numImages, setNumImages] = useState(contentType === 'carrossel' ? 8 : 1);

  const generateArt = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/content/persuasive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'art',
          contentType,
          contentSummary,
          numImages,
        }),
      });

      if (!response.ok) throw new Error('Falha na geração de direção de arte');

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Erro ao gerar arte:', error);
      alert('Erro ao gerar direção de arte. Verifique o console.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Passo 6: Direção de Arte</h2>
      <p className="mb-4">Gere prompts profissionais de imagem para seu conteúdo.</p>

      {contentType === 'carrossel' && (
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Número de imagens (slides):</label>
          <input
            type="number"
            min="1"
            max="12"
            value={numImages}
            onChange={(e) => setNumImages(parseInt(e.target.value) || 1)}
            className="w-32 rounded-md bg-slate-900 border border-slate-700 p-2 text-sm"
          />
        </div>
      )}

      {!result && (
        <button
          onClick={generateArt}
          disabled={generating}
          className="px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-500 transition-colors disabled:opacity-50"
        >
          {generating ? 'Gerando...' : 'Gerar Direção de Arte'}
        </button>
      )}

      {result && (
        <div className="mt-4 space-y-4">
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
            <h3 className="font-bold mb-2">Prompts Gerados:</h3>
            {result.artDirection?.prompts ? (
              <div className="space-y-3">
                {result.artDirection.prompts.map((prompt: string, i: number) => (
                  <div key={i} className="bg-slate-800 p-3 rounded text-sm">
                    <div className="font-semibold text-amber-300 mb-1">Imagem {i + 1}:</div>
                    <div className="text-slate-300">{prompt}</div>
                  </div>
                ))}
              </div>
            ) : (
              <pre className="text-xs bg-slate-800 p-3 rounded overflow-auto max-h-96">
                {JSON.stringify(result.artDirection, null, 2)}
              </pre>
            )}
          </div>
          {result.meta?.mock && (
            <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-3 text-sm text-amber-200">
              ⚠️ {result.meta.warning}
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <button onClick={onPrevious} className="mr-2 px-6 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors">
          Anterior
        </button>
        <button onClick={onNext} className="px-6 py-2 bg-yellow-500 text-blue-900 font-bold rounded-lg shadow-md hover:bg-yellow-400 transition-colors">
          Próximo
        </button>
      </div>
    </div>
  );
};

const StepGeneration = ({ onNext, onPrevious, contentType, objectives, style, sourceContent }: { onNext: () => void; onPrevious: () => void; contentType: string; objectives: string[]; style: string; sourceContent: string }) => {
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const generateContent = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/content/persuasive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'generate',
          contentType,
          objectives,
          style,
          sourceContent,
        }),
      });

      if (!response.ok) throw new Error('Falha na geração de conteúdo');

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      alert('Erro ao gerar conteúdo. Verifique o console.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Passo 7: Geração do Conteúdo</h2>
      <p className="mb-4">
        Gere seu <strong>{contentType}</strong> usando a Constituição Chronoscribe com
        estilo <strong>{style}</strong>.
      </p>

      {!result && (
        <div className="mb-4">
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 mb-4">
            <h3 className="font-semibold mb-2">Configuração:</h3>
            <ul className="text-sm space-y-1 text-slate-300">
              <li>• Tipo: {contentType}</li>
              <li>• Objetivos: {objectives.join(', ')}</li>
              <li>• Estilo: {style}</li>
              <li>• Material base: {sourceContent.length} caracteres</li>
            </ul>
          </div>

          <button
            onClick={generateContent}
            disabled={generating}
            className="px-8 py-4 bg-emerald-600 text-white text-lg font-bold rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-50 shadow-lg"
          >
            {generating ? 'Gerando Conteúdo...' : '✨ Gerar Conteúdo Persuasivo'}
          </button>
        </div>
      )}

      {result && (
        <div className="mt-4 space-y-4">
          <div className="bg-emerald-900/20 border border-emerald-700 rounded-lg p-4">
            <h3 className="font-bold text-emerald-300 mb-2">✓ Conteúdo Gerado!</h3>
            <p className="text-sm text-slate-300">
              Tipo: {result.meta?.contentType} | 
              Gerado em: {result.meta?.timestamp ? new Date(result.meta.timestamp).toLocaleString('pt-BR') : '—'}
            </p>
          </div>

          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 max-h-96 overflow-auto">
            <h3 className="font-bold mb-3">{result.content?.titulo || 'Conteúdo Gerado'}</h3>
            {result.content?.subtitulo && (
              <p className="text-slate-400 mb-4">{result.content.subtitulo}</p>
            )}
            {result.content?.conteudo && Array.isArray(result.content.conteudo) ? (
              <div className="space-y-4">
                {result.content.conteudo.map((section: any, i: number) => (
                  <div key={i}>
                    {section.subtitulo && (
                      <h4 className="font-semibold text-amber-300 mb-2">{section.subtitulo}</h4>
                    )}
                    <div className="text-sm text-slate-300 whitespace-pre-wrap">{section.texto}</div>
                  </div>
                ))}
              </div>
            ) : (
              <pre className="text-xs bg-slate-800 p-3 rounded overflow-auto">
                {JSON.stringify(result.content, null, 2)}
              </pre>
            )}
          </div>

          {result.meta?.mock && (
            <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-3 text-sm text-amber-200">
              ⚠️ {result.meta.warning}
            </div>
          )}
        </div>
      )}

      <div className="mt-6">
        <button onClick={onPrevious} className="mr-2 px-6 py-2 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-500 transition-colors">
          Anterior
        </button>
        <button onClick={onNext} disabled={!result} className="px-6 py-2 bg-yellow-500 text-blue-900 font-bold rounded-lg shadow-md hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          Próximo
        </button>
      </div>
    </div>
  );
};

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
  const [contentType, setContentType] = useState<string>('livro');
  const [objectives, setObjectives] = useState<string[]>(['vendas']);
  const [style, setStyle] = useState<string>('montanha-russa');

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
            onTypeSelect={setContentType}
          />
        );
      case 3:
        return <StepObjective onNext={nextStep} onPrevious={prevStep} onSet={setObjectives} />;
      case 4:
        return <StepStyle onNext={nextStep} onPrevious={prevStep} onSet={setStyle} />;
      case 5:
        return (
          <StepCriticalAnalysis
            onNext={nextStep}
            onPrevious={prevStep}
            content={selectedText || ingested?.combinedText || ''}
            format={contentType}
            style={style}
            onDone={() => {}}
          />
        );
      case 6:
        return (
          <StepArt
            onNext={nextStep}
            onPrevious={prevStep}
            contentType={contentType}
            contentSummary={selectedText.substring(0, 500) || 'Sem resumo disponível'}
          />
        );
      case 7:
        return (
          <StepGeneration
            onNext={nextStep}
            onPrevious={prevStep}
            contentType={contentType}
            objectives={objectives}
            style={style}
            sourceContent={selectedText || ingested?.combinedText || ''}
          />
        );
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
